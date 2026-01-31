import express from "express";
import cors from "cors";
import admin from "firebase-admin";

admin.initializeApp({
 credential: admin.credential.applicationDefault()
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

/* PLANT */
app.post("/plant", async (req,res)=>{
 const {uid,tile} = req.body;
 const ref=db.doc(`users/${uid}`);
 const snap=await ref.get();
 const u=snap.data();

 if(u.money<1) return res.sendStatus(403);
 if(u.tiles?.[tile]) return res.sendStatus(409);

 u.money--;
 u.tiles[tile]={t:"carrot",d:Date.now()};
 await ref.set(u);

 res.json(u);
});

/* HARVEST */
app.post("/harvest", async (req,res)=>{
 const {uid,tile} = req.body;
 const ref=db.doc(`users/${uid}`);
 const snap=await ref.get();
 const u=snap.data();
 const crop=u.tiles?.[tile];

 if(!crop) return res.sendStatus(404);
 if(Date.now()-crop.d<60000) return res.sendStatus(403);

 u.money+=5;
 delete u.tiles[tile];
 await ref.set(u);

 res.json(u);
});

/* MOVE */
app.post("/move", async (req,res)=>{
 const {uid,x,y} = req.body;
 await db.doc(`users/${uid}`).update({x,y});
 res.sendStatus(200);
});

app.listen(3000,()=>console.log("SERVER MMO PORNIT"));


