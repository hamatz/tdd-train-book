# Todoアプリを作りながらTDDを学ぼう - APIサーバ編 Phase5 -

インテグレーションテスト。他の機能とうまく協働できるか？を確認するテストとして、今回は

1. データベースに意図通りのデータがちゃんと保存されるか？  
2. 呼び出し元に意図通りのデータが返却されるか？  

と言ったことを確認することになります。
そのためにまずは本物のデータベースと接続する必要がありますね。

今回は、セットアップの簡便さや非力なマシン環境でも動作させられる利点を考慮し、MongoDB Atlas を利用することにしましょう。

というわけで、以下のURLに行きましょう。

```
https://www.mongodb.com/
```

右上の「Try Free」をクリックし、ユーザー登録をしてください。

その後、無料プランを選択し、AWSでもGCPでも、自分の好きなところを選んで環境を作ってください。特におすすめ等はありません。また、クラスタを作成した際、ネットワークアクセスについても設定が必要になると思いますが、自分のIPアドレスで制限をかけるようにしてもいいでしょうし、今回はテスト目的ということであらゆるIPアドレスを許可するようにしたとしても大きな問題はないでしょう。

何れにしても、本講座は MongoDBの講座ではありませんので、この辺りについて詳しく確認したい場合は公式で無料提供されている以下のページを確認してみてください。

```
MongoDB University
https://university.mongodb.com/
```

さて、MongoDBが利用可能になったことを前提に、次に用意するのはDBへの実際の接続です。mongodbというフォルダを作成し、その中で mongodb.connecter.js というファイルを作ります。環境変数「MONGO_ATLAS_PW」以外の部分も含めて接続先情報は完全に異なりますが、形としてはこのようになるでしょう。

```javascript
const mongoose = require("mongoose");

const connect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://tdd-train-admin:"
       + process.env.MONGO_ATLAS_PW + 
       "@cluster0-ejkue.gcp.mongodb.net/test?retryWrites=true&w=majority",
      { useUnifiedTopology: true,  useNewUrlParser: true  } 
    );
  } catch (err) {
    console.error("Error connecting to mongodb");
    console.error(err);
  }
};

module.exports = { connect };
```

ところで我々が作っているのはWeb APIです。Controllerは作りましたが、クライアントからのリクエストを受け取るためにはRouterを用意し、受け口を用意してあげる必要があります。router/todo.routes.js を作りましょう。

```javascript
const express = require("express");
const todoController = require("../controllers/todo.controller");
const router = express.Router();

router.post("/", todoController.create);

module.exports = router;
```

そしてそのRouterを「app.js」に組み込みます。これでリクエスト受信までの流れは整いました。

```javascript
const express = require("express");
const todoRoutes = require("./routes/todo.routes");
const app = express();
const mongodb = require("./mongodb/mongodb.connecter");

mongodb.connect();

app.use(express.json());

app.use("/todo", todoRoutes);

module.exports = app;
```

さらに、server.js を作成し、サーバーとして起動できるようにしましょう。

```javascript
onst app = require("./app");

app.listen(3000, () => {
  console.log("Server is now running!");
});
```

これで、

```
localhost:3000/todo/create
```

にリクエストを送信することで、TODOデータの登録ができるようになります。



つづく
