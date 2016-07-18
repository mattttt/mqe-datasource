import _ from 'lodash';

export default class MQEQuery {

  /** @ngInject */
  constructor(target, templateSrv, scopedVars) {
    this.target = target;
    this.templateSrv = templateSrv;
    this.scopedVars = scopedVars;
  }

  /////////////////////
  // Query Rendering //
  /////////////////////

  render(timeFrom, timeTo, interval) {
    var target = this.target;
    var query = "";
    query += target.metric;
    if (target.whereClauses.length) {
      query += " where " + this.renderWhereClauses(target.whereClauses);
    }
    query = MQEQuery.addTimeRange(query, timeFrom, timeTo);
    return query;
  }

  renderWhereClauses(whereClauses) {
    var renderedClauses = _.map(whereClauses, (clauseObj, index) => {
      var rendered = "";
      if (index !== 0) {
        rendered += clauseObj.condition + " ";
      }

      // Put non-numeric values into quotes.
      var value;
      if (_.isNumber(clauseObj.value) ||
          this.containsVariable(clauseObj.value)) {
        value = clauseObj.value;
      } else {
        value = "'" + clauseObj.value + "'";
      }
      rendered += clauseObj.column + ' ' + clauseObj.operator + ' ' + value;
      return rendered;
    });
    return renderedClauses.join(' ');
  }

  // Check for template variables
  containsVariable(str) {
    var variables = _.map(this.templateSrv.variables, 'name');
    var self = this;
    return _.some(variables, variable => {
      return self.templateSrv.containsVariable(str, variable);
    });
  }

  ////////////////////
  // Static methods //
  ////////////////////

  static getMetrics() {
    var query = "describe all";
    return query;
  }

  static getColumns(metric) {
    return "describe " + metric;
  }

  static addTimeRange(query, timeFrom, timeTo, interval) {
    var timeRangeRegex = /from.*to/;
    if(!timeRangeRegex.test(query)) {
      query = trim(query) + " from " + timeFrom + " to " + timeTo;
    }
    return query;
  }
}

function trim(str) {
  var trimRegex = /^[\s]*(.*?)[\s]*$/;
  var match = str.match(trimRegex);
  return match ? match[0] : match;
}
