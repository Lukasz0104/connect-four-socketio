import { format } from "fecha";

export const EMPTY: number = 0;
export const RED: number = 1;
export const YELLOW: number = 2;

/**
 * 
 * @param {String} message 
 * @returns Message preceded by current timestamp.
 */
export const formattedMessage = (message: string, level: string) => `[${format(new Date(), 'HH:mm:ss:SSS DD-MM-YYYY')}] [${level}] ${message}`;

export const info = (message: string) => console.info(formattedMessage(message, "INFO"));

export const debug = (message: string) => console.debug(formattedMessage(message, "DEBUG"));
