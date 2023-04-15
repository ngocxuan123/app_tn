import React, { useEffect } from "react";

export interface ILogContentDataProps {
    timestamp: string;
    message: string;
    level: string;
}

export interface ILogContentProps {
    data: ILogContentDataProps[];
}


export const LogContent: React.FC<ILogContentProps> = ({data}) => {

    return (
        <div style={{backgroundColor: 'black', color: 'white', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto'}}>
           {data as any}
        </div>
    )
}


export const LogContentItem: React.FC<ILogContentDataProps> = ({timestamp,level, message })=> {
    return (
        <p>{timestamp} | {level} | {message}</p>
    )
}