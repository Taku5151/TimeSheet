function TimeTracker(props) {
    return (
      <p className="currenttime">{props.currentTime}</p>
    );
}
TimeTracker.propTypes = {
  currentTime: React.PropTypes.string.isRequired
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function StatusTracker(props) {
  switch(props.currentStatus) {
    case "clocked in":
      return (
        <p className="status greencolor">Clocked In</p>
      );
    case "clocked out":
      return (
        <p className="status redcolor">Clocked Out</p>
      );
    case "paused":
      return (
        <p className="status greycolor">Paused</p>
      );
    default:
  }
}
StatusTracker.propTypes = {
  currentStatus: React.PropTypes.string.isRequired
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ClockButton(props) {
  switch(props.currentStatus) {
    case "clocked out":
      return (
        <input type="button" className="clockbutton greencolor" value="Clock In" onClick={function() {props.onclick("clockin");}} />
      );
    case "clocked in":
      return (
        <input type="button" className="clockbutton redcolor" value="Clock Out" onClick={function() {props.onclick("clockout");}} />
      );
    case "paused":
      return (
        <input type="button" className="clockbutton greycolor" value="Clock Out" onClick={function() {props.onclick("clockout");}} disabled />
      );
    default:
      return (
        <input type="button" className="clockbutton greycolor" value="Error" />
      );
  }
}
ClockButton.propTypes = {
  currentStatus: React.PropTypes.string.isRequired,
  onclick: React.PropTypes.func.isRequired
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function PauseButton(props) {
  switch(props.currentStatus) {
    case "clocked out":
      return (
        <input type="button" className="pausebutton greycolor" value="Pause" disabled/>
      );
    case "clocked in":
      return (
        <input type="button" className="pausebutton greycolor" value="Pause" onClick={function() {props.onclick("pause");}}/>
      );
    case "paused":
      return (
        <input type="button" className="pausebutton greencolor" value="Unpause" onClick={function() {props.onclick("unpause");}} />
      );
    default:
      return (
        <input type="button" className="pausebutton greycolor" value="Error" />
      );
  }
}
PauseButton.propTypes = {
  currentStatus: React.PropTypes.string.isRequired,
  onclick: React.PropTypes.func.isRequired
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var TransactionsTable = React.createClass({
  propTypes: {
    transactions: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      date: React.PropTypes.object.isRequired,
      status: React.PropTypes.string.isRequired
    }))
  },

  render: function() {
    return (
      <table className="transactionstable">
        <colgroup>
          <col className="datetimecolumn" />
          <col className="statuscolumn" />
        </colgroup>
        <thead>
          <tr>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
        {this.props.transactions.map(function(transaction) {
          return (
              <TransactionsRow
                date={transaction.date}
                status={transaction.status}
                key={transaction.id}
              />
          );
        })}
        </tbody>
      </table>
    );
  }
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function TransactionsRow(props) {
  var dateString = (props.date.getMonth() + 1) + "/" + props.date.getDate() + "/" + (props.date.getFullYear() - 2000) + " " +
    (props.date.getHours() % 12 === 0 ? 12 : props.date.getHours() % 12) + ":" + (props.date.getMinutes() < 10 ? "0" + props.date.getMinutes() : props.date.getMinutes())
    + " " + (props.date.getHours() < 12 ? "AM" : "PM");
  return (
    <tr>
      <td>{dateString}</td>
      <td>{props.status}</td>
    </tr>
  );
}
TransactionsRow.propTypes = {
  date: React.PropTypes.object.isRequired,
  status: React.PropTypes.string.isRequired
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var App = React.createClass({
  getInitialState: function() {
    return {
      clockInStartTime: 0,
      clockInElapsedTime: 0,
      pauseStartTime: 0,
      pauseElapsedTime: 0,
      currentStatus: "clocked out",
      lastTransactionID: 0,
      transactions: []
    }
  },

  clockAction: function(action) {
    this.state.lastTransactionID += 1;
    if(action === "clockin")
    {
      this.state.transactions.unshift({date: new Date(), status: "Clocked In", id: this.state.lastTransactionID});
      this.setState({
        currentStatus: "clocked in",
        clockInStartTime: Date.now(),
        pauseElapsedTime: 0
      });
      this.interval = setInterval(this.clocktick, 100);
    }
    else if(action === "clockout")
    {
      this.state.transactions.unshift({date: new Date(), status: "Clocked Out", id: this.state.lastTransactionID});
      clearInterval(this.interval);
      this.setState({
        currentStatus: "clocked out"
      });
    }
    else if(action === "pause")
    {
      this.state.transactions.unshift({date: new Date(), status: "Paused", id: this.state.lastTransactionID});
      this.setState({
        currentStatus: "paused",
        pauseStartTime: Date.now()
      });
    }
    else if(action === "unpause")
    {
      this.state.transactions.unshift({date: new Date(), status: "Unpaused", id: this.state.lastTransactionID});
      this.setState({
        currentStatus: "clocked in"
      });
    }
  },

  clocktick: function() {
    if(this.state.currentStatus === "clocked in") {
      this.setState({
        clockInElapsedTime: Date.now() - this.state.clockInStartTime - this.state.pauseElapsedTime
      })
    }
    else if(this.state.currentStatus === "paused") {
      this.setState({
        pauseElapsedTime: Date.now() - this.state.pauseStartTime
      })
    }
  },

  render: function() {
    var timeString =  (Math.floor(this.state.clockInElapsedTime / 3600000) > 9 ? "" : "0") + Math.floor(this.state.clockInElapsedTime / 3600000) + ":" +
                      (Math.floor(this.state.clockInElapsedTime / 60000) % 60 > 9 ? "" : "0") + Math.floor(this.state.clockInElapsedTime / 3600000) % 60 + ":" +
                      (Math.floor(this.state.clockInElapsedTime / 1000) % 60 > 9? "" : "0") + Math.floor(this.state.clockInElapsedTime / 1000) % 60;
    return (
      <div className="timesheet">
        <div className="header">
          <h1 className="title">Timesheet Application</h1>
          <label className="subtitle">Current Session:</label>
          <TimeTracker currentTime={timeString} />
          <br/>
          <label className="subtitle">Current Status:</label>
          <StatusTracker currentStatus={this.state.currentStatus} />
          <br/>
          <ClockButton
            currentStatus={this.state.currentStatus}
            onclick={this.clockAction}
          />
          <PauseButton
            currentStatus={this.state.currentStatus}
            onclick={this.clockAction}
          />
        </div>
        <div className="body"><TransactionsTable
          transactions={this.state.transactions}
        /><TimeSheetTable /><InvoicesTable />
        </div>
      </div>
    );
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ReactDOM.render(
  <App />,
  document.getElementById('main')
);


function TimeSheetTable(props) {
  return (
    <table className="timesheettable">
        <colgroup>
          <col className="checkboxcolumn" />
          <col className="datecolumn" />
          <col className="hourscolumn" />
          <col className="notescolumn" />
        </colgroup>
        <thead>
          <tr>
            <th></th>
            <th>Date</th>
            <th>Hours</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="checkbox" /></td>
            <td>7/31/17</td>
            <td>7:45</td>
            <td>At Home</td>
          </tr>
          <tr>
            <td><input type="checkbox" /></td>
            <td>7/30/17</td>
            <td>8:15</td>
            <td>In Office</td>
          </tr>
        </tbody>
      </table>
  );
}
TimeSheetTable.propTypes = {
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function TimeSheetRow(props) {
//   return (
//
//   );
// }
// TimeSheetRow.propTypes = {
// }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function InvoicesTable(props) {
  return (
    <table className="invoicestable">
        <colgroup>
          <col className="datecolumn" />
          <col className="invoicenumbercolumn" />
          <col className="hourscolumn" />
          <col className="amountcolumn" />
        </colgroup>
        <thead>
          <tr>
            <th>Date</th>
            <th>Invoice#</th>
            <th>Hours</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>7/29/17</td>
            <td>10002</td>
            <td>40</td>
            <td>$2,000</td>
          </tr>
          <tr>
            <td>7/27/17</td>
            <td>10001</td>
            <td>20</td>
            <td>$1,000</td>
          </tr>
        </tbody>
      </table>
  );
}
InvoicesTable.propTypes = {
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function InvoicesRow = {
//   return (
//
//   );
// }
// InvoicesRow.propTypes = {
// }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
