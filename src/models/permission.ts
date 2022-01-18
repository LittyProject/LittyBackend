import * as z from "zod";

export const rolePerms: string[] = [
    'SEND_MESSAGE',
    'ADD_FILE',
    'MANAGE_MESSAGES',
    'MANAGE_SERVER',
    'MANAGE_CHANNELS',
    'MANAGE_ROLES',
    'MANAGE_INVITES',
    'MANAGE_TODO',
    'ADMINISTRATOR',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'CREATE_INVITES',
    'CREATE_TODO_LIST',
    'CREATE_TODO_CARD',
];

export const perms = z.object({
    name: z.string().refine(a=> rolePerms.includes(a),{
        message: "Unknown perms"
    }),
    type: z.boolean()
})

export const defaultPerms = function(){
    let a : Permission[] = [];
    rolePerms.forEach(b=>{
        if(b==='SEND_MESSAGE'||b==="ADD_FILE"||b=="CREATE_INVITES"){
            a.push({name: b, type: true});
        }else{
            a.push({name: b, type: false});
        }
    })
    return a;
}

export const addNonePerms = function(perms : Permission[]){
    let a : Permission[] = perms;
    rolePerms.forEach(b=>{
        if(!a.find(a=> a.name===b)){
            a.push({name: b, type: false});
        }
    })
    a = a.filter(b=> rolePerms.includes(b.name));
    return a;
}

export type Permission = z.infer<typeof perms>;
