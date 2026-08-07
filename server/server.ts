import express from 'express';
import cors from 'cors';


const app = express();

app.use(cors());
app.use(express.json());


// == LOGIN ==
app.use('/api', Loginrouter);


app.listen(3000, ()=>{
    console.log('app listening');
});