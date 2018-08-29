const mail = require("sendgrid").mail;
const eConfig = require("../res/emailConfg");
const sendGrid = require("sendgrid")(eConfig.sendGridKey);
const emailTemplate = require("../models/emailTemplate");

module.exports = {
    sendEmail: (receiver, content, template_key, language_name) => {
        
        const senderEmail = new mail.Email(eConfig.sender);
        const receiverEmail = new mail.Email(receiver);
        //content
        //ToDo
        var title = "Greetings from Wain013.com";
        var body = "Greetings from Wain013.com";
        var emailContent;

        emailTemplate.EmailTemplate.getTemplateByType(template_key)
            .then(template => {

                if(!template) {
    
                    throw { message: "template '"+ template_key +"' does not exist" };
                }
    
                title = template.template.arabic.title;
                body = template.template.arabic.body;

                switch( language_name.toLowerCase() ) {
                    case "arabic":
                        title = template.template.arabic.title;
                        body = template.template.arabic.body;
                        break;

                    case "english":
                        title = template.template.english.title;
                        body = template.template.english.body;
                        break;
                    
                    default:
                        
                        throw {message: "EmailHandler::senderEmail : language '" + language_name +  "' not supported"};
                        break;

                }
    
                for (var key in content) {
                    var find = '[['+key+']]';
                    body = body.replace(find, content[key]);
                    title = title.replace(find, content[key]);
                }
    
                emailContent = new mail.Content("text/html", body);

                const email = new mail.Mail(senderEmail, title, receiverEmail, emailContent);
                
                email.setTemplateId(eConfig.mainTemplate.id);
                const request = sendGrid.emptyRequest({
                    method: "POST",
                    path: "/v3/mail/send",
                    body: email.toJSON()
                });
                
                return sendGrid.API(request, function(error, response) {
                    
                    if (error) { throw(error); }

                    //console.log(response.statusCode)
                    //console.log(response.body)
                    //console.log(response.headers)
                        
                });
    
            })
            .catch(err => {
                
                console.log('Sendmail error: ', err);
                throw(err); //TODO: what actions should be taken here??
            });
    }
};