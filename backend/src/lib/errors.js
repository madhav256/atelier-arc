export class AppError extends Error { constructor(status,message,code='ERROR',details){super(message);this.status=status;this.code=code;this.details=details;} }
export const asyncHandler=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
export const notFound=(req,res,next)=>next(new AppError(404,'Resource not found','NOT_FOUND'));
export const errorHandler=(err,req,res,_next)=>{const status=err.status||500; if(status>=500) console.error(err); res.status(status).json({success:false,error:{code:err.code||'INTERNAL_ERROR',message:status>=500&&process.env.NODE_ENV==='production'?'Something went wrong':err.message,details:err.details,requestId:req.id}})};
