import * as handlebar from 'handlebars';

export default function confirmEmailTemplate(link: string, name: string): string {

  const emailData: any = {
    emailLink: link,
    username: name
  };

  const emailSource = `<p>Thank you for signing up {{username}},</p>
    <p>&nbsp;</p>
    <p>To complete your registration and confirmation of your email address at Deep Dive, please use the following code to verify your account,</p>
    <p>&nbsp;</p>
    <p>{{emailLink}}</p>
    <p>&nbsp;</p>
    <p>Thank you!</p>
    <p>Team Deep Dive</p>`;

  const compiledEmail: HandlebarsTemplateDelegate = handlebar.compile(emailSource);
  return compiledEmail(emailData);
}
