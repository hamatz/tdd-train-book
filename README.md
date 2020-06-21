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

ちなみに、環境変数を使う場合には dotenvなどを利用するのが一般的みたいですが、jestで使うだけならば他の方法もあります。

jest.config.js でセットアップファイルの場所を宣言し、

```javascript
module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest/setEnvVars.js"]
};
```

そこで示すファイル(jest/setEnvVars.js)で環境変数を宣言します。

```javascript
process.env.MONGO_ATLAS_PW = "this_is_test_purpose_value_do_not_use";
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
3. 定義されていないstatusが設定されている

あるいは逆に、

4. 必須ではない項目が設定されていなくても保存ができる

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
        message: 'Description should be between 0 and 250 characters'
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

必須の項目、例えばstatusが設定されていないデータを用意してみましょう。

```json
{
    "title": "Missing done property",
    "description": "ちゃんと登録エラーにできているかテスト"
}
```

タイトルが無いデータもエラーにすべきですね。

```json
{
    "title": "",
    "description": "Titleの文字数が０だと登録できないテスト",
    "status": "OPEN"
}
```
statusに定義されていないデータをセットしている場合もダメですね。

```json
{
    "title": "テストだよ３",
    "description": "登録できてはいけないテストデータ",
    "status": "FINISHED"
} 
```
文字数制限の超過もみておきましょうか。

```json
{
    "title": "Descriptionの文字数制限オーバー",
    "description": "Descriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバーDescriptionの文字数制限オーバー",
    "status": "OPEN"
}
```

```json
{
    "title": "タイトルだよタイトルだよタイトルだよタイトルだよタイトルだよタイトルだよタイトルだよ",
    "description": "Titleの文字数制限オーバー",
    "status": "OPEN"
}
```

そして逆に、必須でないデータがちゃんと登録できているか？も確認しておきましょう。

```json
{
    "title": "Descriptionはなくても登録できるかテスト",
    "status": "OPEN"
}
```

これらを全てチェックするとなると、追加すべきテストとしてはこのようになりますかね。

```javascript
const request = require("supertest");
const app = require("../../app");

const newTodo = require("../mock-data/new-todo.json");
const errTodo = require("../mock-data/error-todo.json");
const errTodo2 = require("../mock-data/error-todo2.json"); 
const errTodo3 = require("../mock-data/error-todo3.json");
const errTodo4 = require("../mock-data/error-todo4.json");
const errTodo5 = require("../mock-data/error-todo5.json");
const newTodo2 = require("../mock-data/new-todo2.json");

const endpointUrl = "/todo/";

describe(endpointUrl, () => {
  it("POST " + endpointUrl, async () => {
    const response = await request(app).post(endpointUrl).send(newTodo);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(newTodo.title);
    expect(response.body.description).toBe(newTodo.description);
    expect(response.body.status).toBe(newTodo.status);
  });
    it(
    "should return error 500 on malformed data with POST" + endpointUrl,
    async () => {
      const response = await request(app).post(endpointUrl).send(errTodo);
      expect(response.statusCode).toBe(500);
      expect(response.body).toStrictEqual({
        "message": "Todo validation failed: status: Path `status` is required."
      });
    }
  );
  it(
    "should return error 500 on malformed data of status property with POST" + endpointUrl,
    async () => {
      const response = await request(app).post(endpointUrl).send(errTodo2);
      expect(response.statusCode).toBe(500);
      expect(response.body).toStrictEqual({
        "message": "Todo validation failed: status: `FINISHED` is not a valid enum value for path `status`."
      });
    }
  );
  it(
    "should return error 500 on malformed data in title property with POST" + endpointUrl,
    async () => {
      const response = await request(app).post(endpointUrl).send(errTodo3);
      expect(response.statusCode).toBe(500);
      expect(response.body).toStrictEqual({
        "message": "Todo validation failed: title: Path `title` is required."
      });
    }
  );
  it(
    "should return error 500 on malformed data in description property  (length too much) with POST" + endpointUrl,
    async () => {
      const response = await request(app).post(endpointUrl).send(errTodo4);
      expect(response.statusCode).toBe(500);
      expect(response.body).toStrictEqual({
        "message": "Todo validation failed: description: Description should be between 1 and 250 characters"
      });
    }
  );
  it(
    "should return error 500 on malformed data in title property (length too much) with POST" + endpointUrl,
    async () => {
      const response = await request(app).post(endpointUrl).send(errTodo5);
      expect(response.statusCode).toBe(500);
      expect(response.body).toStrictEqual({
        "message":  "Todo validation failed: title: Title should be between 1 and 30 characters"
      });
    }
  );
  it("should succcess even when data does not have description property with POST " + endpointUrl, async () => {
    const response = await request(app).post(endpointUrl).send(newTodo2);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(newTodo2.title);
    expect(response.body.status).toBe(newTodo2.status);
  });
});
```

さて、テストを実行してみましょう。

```
ここに実行結果をペーストする
```

実際には想定するエラーメッセージが違ったりして、テストを実態に合わせるなどの作業をしながらの完成になる形が多いかと思いますが、流れとしては見えたのではないかと思います。

さて、ここまでで終わってもいいのですが、もう少し難しいデータまで広げてみましょう。

せっかく扱っているテーマがTODOですし、締切日など時間の概念を持たせてみるのはどうでしょうか？今までのテスト用データを作っていて想像されたかもしれませんが、本来テストとはテストの都度書き直す必要なく、同じものが動作するのが当然であるべきです。

しかし、例えば「締切日が今より未来の日付であれば登録可能」という項目をチェックするために、常にOKとなるデータはどのように用意することができるでしょうか？

一番シンプルなのは、「現在」の定義を固定にして、テスト用のオブジェクトをいつ受け取っても「未来」「過去」の判定が変わらないようにすることです。つまり、現在時刻をモックするわけですね。例えば時刻チェックロジックの前処理として挟むならこんな感じでしょうか。


```javascript
  beforeEach(() => {
    Date.now = jest.fn(() => 1592576130000); // 2020-06-19T14:15:30.000Z
  });
```

他にはどんなチェックすべき項目があるでしょう？まずはアプリケーションの仕様という観点から考えてみましょうか。

・何日先までのデータ登録を許容するか？（たとえば締切は180日先までとするなど）  
・２月２９日はその年に存在するのか？  

その他、ユーザをサポートするという観点で見ると、こんなことを考えてもいいのかもしれません。
 
・並行して登録できる（同時進行を許容する）TODOは上限を10までとする  
・期日になるとメールで教えてくれる  


つづく
