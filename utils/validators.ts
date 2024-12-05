import validator from 'validator';
import { ENV } from '../config/env';

export const validateEmail = (email: string): boolean => validator.isEmail(email) && email.endsWith(ENV.IFB_DOMAIN);

export const validatePassword = (password: string): boolean => 
    validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    });
