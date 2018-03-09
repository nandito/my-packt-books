require('dotenv').load({
  path: __dirname + '/.env'
});

var request = require('request');
var cheerio = require('cheerio');
var loginDetails = {
  email: process.env.PACKT_EMAIL,
  password: process.env.PACKT_PASSWORD,
  op: "Login",
  form_id: "packt_user_login_form",
  form_build_id: ""
};
var loginError = 'Sorry, you entered an invalid email address and password combination.';
var url = 'https://www.packtpub.com/packt/offers/free-learning';

//we need cookies for that, therefore let's turn JAR on
request = request.defaults({
  jar: true
});

console.log('----------- Packt My Books Fetching Started -----------');
request(url, function (err, res, body) {
  if (err) {
    console.error('Request failed');
    console.log('----------- Packt My Books Fetching Done --------------');
    return;
  }

  var $ = cheerio.load(body);

  var newFormId = $("input[type='hidden'][id^=form][value^=form]").val();

  if (newFormId) {
    loginDetails.form_build_id = newFormId;
  }

  request.post({
    uri: url,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: require('querystring').stringify(loginDetails)
  }, function (err, res, body) {
    if (err) {
      console.error('Login failed');
      console.log('----------- Packt My Books Fetching Done --------------');
      return;
    };
    var $ = cheerio.load(body);
    
    var loginFailed = $("div.error:contains('" + loginError + "')");
    if (loginFailed.length) {
      console.error('Login failed, please check your email address and password');
      console.log('Login failed, please check your email address and password');
      console.log('----------- Packt My Books Fetching Done --------------');
      return;
    }

    request('https://www.packtpub.com/account/my-ebooks', function (err, res, body) {
      if (err) {
        console.error('Request Error');
        console.log('----------- Packt My Books Fetching Done --------------');
        return;
      }

      scrape(
        body,
        (data) => {
          console.log(err || data);
        })

      console.log('----------- Packt My Books Fetching Done --------------');
    });
  });
});

function scrape(body, callback) {
  let $ = cheerio.load(body), pageData = []
  
  $('.product-line').each((index, item) => {
    const title = $(item).find('.title').text().trim()
    const href = $(item).find('.product-thumbnail a').attr('href')

    if (!title) {
      return null
    }

    pageData.push(
      {
        title,
        link: 'https://www.packtpub.com/' + href,
        category: href.split('/')[1],
      }
    )
  })

  callback(pageData);
}
