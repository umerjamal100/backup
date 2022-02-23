import * as handlebar from 'handlebars';

export default function forgotPasswordEmailTemplate(name: string, code: string): string {

  const emailData: any = {
    username: name,
    code: code,
  };

  const emailSource = `<p>Hi {{username}},</p>
    <p>&nbsp;</p>
    <p>It seems like you’ve forgotten your password for your Deep DIve account!</p>
    <p></p>
    <p>To reset your password and access your account, either click or paste the following link into the address bar of your browser:&nbsp;</p>
    <p>&nbsp;</p>
    <p><strong>Please use the code given below to reset your password!</strong></p>
    <p>&nbsp;</p>
    <p>{{code}}</p>
    <p>&nbsp;</p>
    <p>In case you face any difficulty while using the product, feel free to reply to this email.</p>
    <p>&nbsp;</p>
    <p>Thank you!</p>
    <p>Team Deep Dive</p>`;

  const compiledEmail: HandlebarsTemplateDelegate = handlebar.compile(emailSource);
  return compiledEmail(emailData);
}