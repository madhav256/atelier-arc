import 'dotenv/config';
const required = ['JWT_ACCESS_SECRET','JWT_REFRESH_SECRET'];
if(process.env.NODE_ENV==='production') required.forEach(k=>{if(!process.env[k]) throw new Error(`Missing ${k}`)});
export const env={port:Number(process.env.PORT||4000), mongoUri:process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/atelier_arc', accessSecret:process.env.JWT_ACCESS_SECRET||'development-access-secret-change-me', refreshSecret:process.env.JWT_REFRESH_SECRET||'development-refresh-secret-change-me', clientOrigins:(process.env.CLIENT_ORIGINS||'http://localhost:5173').split(',')};
