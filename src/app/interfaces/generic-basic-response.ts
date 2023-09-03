export interface GenericBasicResponse<T>{
    code: number,
    status: string,
    message: string,
    data?: T
}