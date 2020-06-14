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
const app = require("./app");

app.listen(3000, () => {
  console.log("Server is now running!");
});
```

これで、

```
localhost:3000/todo/create
```

にリクエストを送信することで、TODOデータの登録ができるようになります。

それでは準備ができましたので、具体的にどのようなテストが必要になるか？を考えていきましょう。

言うまでもなくまずは送られてきたデータが登録され、登録されたデータが返却されるという、当たり前のことができなければいけませんね。http通信でデータを受け取った状態をmockするために、新たに supertest を入れましょう。

```
npm install supertest --save-dev
```

jestと同じく、テストでしか利用しないパッケージですので、｀--save-dev`を使いました。

これを利用するテストは tests/integration/todo.controller.int.test.js に配置します。データが登録された場合には、慣例に倣って status 201 を返すことにでもしておきましょうか。

```javascript
const request = require("supertest");
const app = require("../../app");

const newTodo = require("../mock-data/new-todo.json");

const endpointUrl = "/todo/";

describe(endpointUrl, () => {
  it("POST " + endpointUrl, async () => {
    const response = await request(app).post(endpointUrl).send(newTodo);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(newTodo.title);
    expect(response.body.description).toBe(newTodo.description);
    expect(response.body.status).toBe(newTodo.status);
  });
});
```

さて、ここまででテストしてみましょうか。

```
ここにJestのテスト結果をペーストする
```

MongoDBの接続設定(特に環境変数の読み込みに注意しましょう）が間違っていなければ、問題なく動作したのではないかと思います。

では、他にはどのような項目をテストするといいでしょうか？ちょっと考えてみましょう。

まず、送信するデータのフォーマットチェックが必要ですね。それでは、例えばどんなフォーマット違反があるでしょうか？

1. 必須の項目がない
2. 入力可能な文字数をオーバーしている

あるいは逆に、

3. 必須ではない項目が設定されていなくても保存ができる

ということも確認できた方が良いでしょうね。では、必須の項目や文字数についてはどこで定義するものでしょうか？
そうですね。データモデルでやるべきでしょう。

例えばこのような形になるでしょうか？

```javascript
const mongoose = require("mongoose");
const validate = require("mongoose-validator");

const titleValidator = [
    validate({
        validator: 'isLength',
        arguments: [1, 30],
        message: 'Title should be between 1 and 30 characters'
    })
]

const descValidator = [
    validate({
        validator: 'isLength',
        arguments: [0, 250],
        message: 'Description should be between 1 and 250 characters'
    })
]

const TodoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    validate: titleValidator,
  },
  description: {
    type: String,
    required: false,
    validate: descValidator,
  },
  status: {
    type: String,
    enum: ["OPEN", "IN_PROGRESS", "IN_REVIEW", "DONE"],
    required: true,
  },
});

const TodoModel = mongoose.model("Todo", TodoSchema);

module.exports = TodoModel;
```



つづく
