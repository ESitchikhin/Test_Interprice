import Vue from 'vue';
import Vuex from 'vuex';
import json from '../assets/data.json';


Vue.use(Vuex)

export default new Vuex.Store({
  getters: {
    selectedCurrency: state => state.selectedCurrency,
    selectedYears: state => state.selectedYears,
    parameters: state => state.parameters,
    displayParameter: state => state.displayParameter,
    
    currencies: state => {
      const currenciesSet = new Set();
      if(state.data.Items) {
        state.data.Items.forEach(company => {
          if (company.Quote) {
            company.Quote.forEach(quote => {
              if(quote.Currency) {
                currenciesSet.add(quote.Currency);
              } else {
                currenciesSet.add('USD');
              }
            })
          }
        });
      }
      return Array.from(currenciesSet);
    },
    
    yrs: state => {
      const yearsSet = new Set();
      if(state.data.Items) {
        state.data.Items.forEach(company => {
          if (company.Quote) {
            company.Quote.forEach(quote => {
              const isSelectedCurrency = quote.Currency
                ? quote.Currency === state.selectedCurrency
                : state.selectedCurrency === 'USD';
              if(isSelectedCurrency && quote.Years) {
                yearsSet.add(+quote.Years);
              }
            })
          }
        });
      }
      return Array.prototype.sort.call(Array.from(yearsSet), (a, b) => a - b).map(year => `${year} YRS`);
    },
  
    couponTypes: state => {
      const couponTypesSet = new Set();
      if(state.data.Items) {
        state.data.Items.forEach(company => {
          if (company.Quote) {
            company.Quote.forEach(quote => {
              const isSelectedCurrency = quote.Currency
                ? quote.Currency === state.selectedCurrency
                : state.selectedCurrency === 'USD';
              if(isSelectedCurrency && quote.CouponType) {
                couponTypesSet.add(quote.CouponType);
              }
            })
          }
        });
      }
      return Array.prototype.sort.call(Array.from(couponTypesSet));
    },
  
    filterByCompanyStr: state => state.filterByCompanyStr,
    
    headersData: (state, getters) => {
      const headers = [
        {
          text: 'DATE SENT',
          value: 'dateSet',
          align: 'start',
          sortable: true,
          isDate: true,
          length: 2,
          base: true,
        },
        {
          text: 'COMPANY',
          value: 'company',
          align: 'start',
          sortable: true,
          filterable: true,
          base: true,
          param: true,
        },
			];
  
      let headerItem = {}
      
      getters.yrs.forEach(year => {
        if(Array.prototype.indexOf.call(state.selectedYears, year) !== -1) {
          headerItem = {
            text: year,
            align: 'center',
          };
          let subItems = []
          getters.couponTypes.forEach(type => {
            subItems.push({
              text: type,
              value: `${year}.${type}`,
              align: 'center',
              length: getters.couponTypes.length > 1 ? 1 : 2,
              highlight: type === 'FIX'
            });
          })
          headerItem['subItems'] = subItems;
          headers.push(headerItem);
        }
      })
      
      return headers;
    },
  
    resultData: (state, getters) => {
    const resultData = [];
    
    if(state.data.Items) {
      for (const dataItem of state.data.Items) {
        let company = dataItem.Company;
        let preferred = dataItem.Preferred;
        const emptyRow = {
          company,
          preferred,
          dateSet: '',
          isActive: false,
        };
        
        if (dataItem.DateSent && dataItem.Quote && dataItem.Quote.length > 0) {
          const resultCompanyRows = []
          const resultDateSent = new Date(dataItem.DateSent);
          let isNotEmpty = false;
          
          // Setup Empty Rows for result Table
          state.parameters.forEach(param => {
            let resultCompanyRowForParam = {
              company,
              param,
              dateSet: resultDateSent,
              isActive: true,
            }
            
            getters.yrs.forEach(year => {
              if(Array.prototype.indexOf.call(state.selectedYears, year) !== -1) {
                resultCompanyRowForParam[year] = {};
                getters.couponTypes.forEach(type => {
                  resultCompanyRowForParam[year][type] = '';
                })
              }
            })

            resultCompanyRows.push(resultCompanyRowForParam);
          })
          
          // Set values for rows
          dataItem.Quote.forEach(quote => {
            const yrsString = `${quote.Years} YRS`;
            
            if(quote.Currency === state.selectedCurrency
              && Array.prototype.indexOf.call(state.selectedYears, yrsString) !== -1) {
              
              state.parameters.forEach(param => {
                const index = resultCompanyRows.findIndex(el => el.param === param);
                let value = quote[param];
                if(value) {
                  isNotEmpty = true;
                  switch (param) {
                    case 'Spread':
                    case '3MLSpread':
                      value = value > 0 ? `+${value}bp` : `-${value}bp`;
                      break;
                    case 'Yield':
                      value = (Math.round(value * 1000)/1000).toString();
                      if(value.length < 5) {
                        for(let i = value.length; i < 5; i++) {
                          value += '0';
                        }
                      }
                      value += '%';
                      break;
                  }
                  resultCompanyRows[index][yrsString][quote.CouponType] = value;
                }
              })
            }
          });
          if(isNotEmpty) {
            resultCompanyRows.forEach(row => resultData.push(row))
          } else {
            resultData.push(emptyRow)
          }
        } else {
          resultData.push(emptyRow)
        }
      }
    }
    return resultData
  },
  
    averageData: (state, getters) => {
      const average = {
        dateSet: '',
        company: 'Average by ' + getters.displayParameter,
      };
  
      const sum = {};
      const count = {};
      
      getters.yrs.forEach(year => {
        if(Array.prototype.indexOf.call(state.selectedYears, year) !== -1) {
          average[year] = {};
          sum[year] = {};
          count[year] = {};
          getters.couponTypes.forEach(type => {
            average[year][type] = 0;
            sum[year][type] = 0;
            count[year][type] = 0;
          })
        }
      })
      
      if(state.data.Items) {
        for (const dataItem of state.data.Items) {
  
          if(dataItem.Quote && dataItem.Quote.length > 0) {
  
            dataItem.Quote.forEach(quote => {
              const yrsString = `${quote.Years} YRS`;
    
              if(quote.Currency === state.selectedCurrency
                && Array.prototype.indexOf.call(state.selectedYears, yrsString) !== -1) {
                
                if(yrsString === '10 YRS' && quote.CouponType === 'FIX' && getters.displayParameter === 'Yield') {
                  sum[yrsString][quote.CouponType] = sum[yrsString][quote.CouponType];
                }
                if(quote[getters.displayParameter]) {
                  sum[yrsString][quote.CouponType] += parseFloat(quote[getters.displayParameter]);
                  count[yrsString][quote.CouponType] += 1;
                }
              }
            });
          }
        }
      }
      
      for(let year in sum) {
        for (let type in sum[year]) {
          let value = 0;
          switch (getters.displayParameter) {
            case 'Spread':
            case '3MLSpread':
              value = sum[year][type] > 0 && count[year][type] > 0
                ? `+${Math.round(sum[year][type] / (count[year][type]))}bp`
                .toString()
                : '';
              break;
            case 'Yield':
              value = sum[year][type] != 0 && count[year][type] > 0
                ? (sum[year][type] / (count[year][type] || 1))
                : 0;
              value = (Math.round(value * 1000)/1000);
              if(value != 0) {
                let digit = 5
                if (value < 0) {
                  digit = 6;
                }
                value = value.toString();
                if (value.length < digit) {
                  for (let i = value.length; i < 5; i++) {
                    value += '0';
                  }
                }
                value += '%';
              } else {
                value = '';
              }
              break;
          }
  
          average[year][type] = value;
        }
      }
      return average;
    }
  },
  state: {
    data: {},
    selectedCurrency: '',
    selectedYears: [],
    parameters: ['Spread', 'Yield', '3MLSpread'],
    displayParameter: '',
    
    filterByCompanyStr: '',
    
  },
  mutations: {
    SET_DATA(state, data) {
      state.data = data;
    },
    
    SET_SELECTED_CURRENCY(state, currency) {
      state.selectedCurrency = currency;
    },
    
    ADD_YEAR_TO_SELECTED_YEARS(state, year) {
      state.selectedYears.push(year);
    },
    REMOVE_YEAR_FROM_SELECTED_YEARS(state, index) {
      state.selectedYears.splice(index, 1);
    },
    SET_SELECTED_YEARS(state, selectedYears) {
      state.selectedYears = selectedYears;
    },
    
    SET_DISPLAY_PARAMETER(state, param) {
      state.displayParameter = param;
    },
    
    SET_FILTER_BY_COMPANY(state, str) {
      state.filterByCompanyStr = str;
    }
  },
  actions: {
    async fetchData(ctx) {
      await ctx.commit('SET_DATA', json);
    },
    
    selectCurrency(ctx, currency) {
      if(Array.prototype.indexOf.call(ctx.getters.currencies, currency) !== -1) {
        ctx.commit('SET_SELECTED_CURRENCY', currency);
      }
    },
  
    async selectAllYears(ctx) {
      await ctx.dispatch('clearSelectYears');
      for(const year of ctx.getters.yrs) {
        await ctx.dispatch('toggleSelectedYear', year);
      }
    },
    
    toggleSelectedYear(ctx, year) {
      const index = Array.prototype.indexOf.call(ctx.state.selectedYears, year);
      if(index === -1) {
        ctx.commit('ADD_YEAR_TO_SELECTED_YEARS', year);
      } else {
        ctx.commit('REMOVE_YEAR_FROM_SELECTED_YEARS', index);
      }
    },
  
    clearSelectYears(ctx) {
      ctx.commit('SET_SELECTED_YEARS', []);
    },
    
    selectDisplayParameter(ctx, param) {
      if(Array.prototype.indexOf.call(ctx.getters.parameters, param) !== -1) {
        ctx.commit('SET_DISPLAY_PARAMETER', param);
      }
    },
    
    setFilterByCompany(ctx, str) {
      ctx.commit('SET_FILTER_BY_COMPANY', str);
    }
    
  },
})
