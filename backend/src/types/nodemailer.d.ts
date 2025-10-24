declare module 'nodemailer' {
  export interface Transporter {
    sendMail(mailOptions: any): Promise<any>;
    verify(): Promise<boolean>;
  }
  
  export function createTransporter(options: any): Transporter;
  export function createTransport(options: any): Transporter;
}
