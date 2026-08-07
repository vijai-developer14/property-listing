import {Pool} from 'pg'


const pool = new Pool({
    host:'localhost',
    database:'movies',
    user:'postgres',
    password:'root',
    port:5432
})
 
export default pool
