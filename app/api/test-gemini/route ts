import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
export const dynamic = "force-dynamic";
const KEY = "AQ.Ab8RN6JdLKFO8VaAUWD7Z_mS03os-CNqJf_-eG0RBsT0O-ohUg";
export async function GET(){
 try{
  const ai = new GoogleGenAI({apiKey: KEY});
  const r = await ai.models.generateContent({model:"gemini-1.5-flash", contents:"Say hello in 5 words, testing API"});
  return NextResponse.json({success:true, keyLen: KEY.length, answer: r.text});
 }catch(e:any){
  return NextResponse.json({success:false, error: e.message, keyLen: KEY.length}, {status:500});
 }
}
