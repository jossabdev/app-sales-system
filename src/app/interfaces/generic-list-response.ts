export interface GenericListResponse<T>{
    code: number,
    status: string,
    message: string,
    data: T[]
}