
export const userFlags: string[] = [
    'STAFF',
    'DEVELOPER',
    'PARTNER',
    'BUG_HUNTER_1',
    'BUG_HUNTER_2',
    'VIP'
]

export const serverFlags: string[] = [
    'PARTNERED',
    'PUBLIC',
    'VERIFIED'
]

export default function rolePerms(){
    return {
        "SEND_MESSAGE": true,
        "VIEW_CHANNELS": true,
    }
}