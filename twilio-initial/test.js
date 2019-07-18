// const twilio = require('twilio')('AC85863d0f33921d924277c72a096e0689', '3e4b58fd99c59e1d8e5023bd369cb440');
// const service = twilio.notify.services('IS3576ea44c8386d3babaa5eed28ad5602');

// const numbers = ['+19194577058'];
// const body = 'Test Twilio Initial Message';

// const bindings = numbers.map(number => {
// 	return JSON.stringify({ binding_type: 'sms', address: number });
// });


// service.notifications
//       .create({
//         toBinding: bindings,
//         body: body
//       })
//       .then(() => {
//         console.log('Messages sent!');
//       })
//       .catch(err => {
//         console.error(err);
//       })
//       .done();

function getAdjustedResponseDate() {
  var d = new Date();
  if (d.getHours() < 18) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

console.log(formatDate(getAdjustedResponseDate()));