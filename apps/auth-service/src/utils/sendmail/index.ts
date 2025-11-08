import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
import ejs from "ejs";
import path from 'path'
import { fileURLToPath } from 'url';
import { emailTemplate } from '../email-templates/email-templates';

dotenv.config();

const transporter = nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port:Number(process.env.SMTP_PORT),
    service:process.env.SMTP_SERVICE,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    }
})


// Render EJS Template

const renderEmailTemplate = async (templateName:string,data:Record<string,any>):Promise<string>=>{
    
    

    // const templatePath = path.join(
    //     __dirname,
    //     "..",
    //     "..",
    //     'utils',
    //     'email-templates',
    //     `${templateName}.ejs`

    // );
// console.log("__________________________________",templatePath,"__________________________________");
const template = emailTemplate[templateName];   
console.log("__________________________________",template,"__________________________________"); 
if (!template) {
    throw new Error(`Template "${templateName}" not found`);
}
return  ejs.render(template,data )
}

// send an email using nodemailer

export const sendEmail = async(to:string, subject:string,templateName:string,data:Record<string,any>)=>{
try {
    // console.log("_________________________")
    // console.log(to,subject,templateName);
    // console.log("_________________________")
       
    const html = await renderEmailTemplate(templateName,data);
    await transporter.sendMail({
        from:`<${process.env.SMTP_USER}>`,
        to,
        subject,
        html
    });

    return true;
} catch (error) {
    console.log("Error in sending email ",error);
    return false
}


}













