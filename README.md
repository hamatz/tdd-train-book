# Todoアプリを作りながらTDDを学ぼう - APIサーバ編 Phase4 -

さて、本格的に作業を始める前に、１つやっておくことがありました。
テストを実施する上で必要になる２つのパッケージをインストールしましょう。

まず１つ目は、TODOのデータモデルを定義するための mongooseです。

```
npm install mongoose --save
```

それから次に、HTTP通信部分をモックしてくれる node-mocks-http を入れます。todo.controllerは、HTTP通信で取得したデータを受け取った後の部分の処理を担当するわけですので、その通信で受け取ったと想定されるデータを引き渡してくれる相手を擬似的に作り出してあげる必要があります。

```
npm install node-mocks-http --save
```

問題なくインストールできたでしょうか？それでは次に、TODOのデータモデルを定義しましょう。TODOデータはどのような情報を持っていれば良いでしょうか？  

一般的なTODOアプリにならい、まずは  

・タイトル　：文字列（必須）  
・説明　：文字列（オプション）  
・状態　：文字列（必須）（状態は　OPEN, IN_PROGRESS, IN_REVIEW, DONE　の４種)  

くらいにしておきましょうか。  


```javascript
const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
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

大体は見ての通りですが、TODOの進捗状況を示す status のところで enum というものが使われています。これは、この４つ以外の状態を保存しないよう制約をかけるのに利用されています。  

練習としてこのように例示しましたが、もちろん statusの情報内容を別のものに変更したり、画像などの他の情報を持たせるように変えてもらっても構いません。むしろただの写経では身につかないので、何らか自分なりの拡張をしていくことをお勧めします。

さて、ここまできたら、元々の話にようやく戻れます。そう。「CRUD」のC、createから始めよう、という話でしたね。createはどういう関数であるべきでしょうか？

まず、当たり前ですが、「TODOに登録するデータを受け取って、それを保存する」というのが役割ですね。それをもう少し分解して考えてみましょうか。つまり、処理の流れを簡単に示すとすると...

HTTP Request （TODOデータ）→　todo.controller →　database

のようになると思います。

TODOデータはどのような形で飛んでくるでしょうか？ここでは一般的なJSON形式を使うことにしましょう。例えばこんな感じでしょうか？

```json
{
    "title": "テストだよ",
    "description": "とりあえず登録できているかテスト",
    "status": "OPEN"
}
```

このデータを、new-todo.jsonというファイル名でtestフォルダ配下にmock-dataというサブフォルダを作り保存しておきましょう。

では、この受け取ったデータを保存するにあたって、todo.controllerの中ではどのような処理が走ることになるでしょう？　それをテストの形で記述してみます。

```javascript
const TodoController = require("../../controllers/todo.controller");
const TodoModel = require("../../model/todo.model");
const httpMocks = require("node-mocks-http");
const newTodo = require("../mock-data/new-todo.json");

TodoModel.create = jest.fn();

let req, res, next;
beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = jest.fn();
});

describe("TodoController.create", () => {

  it("should Call TodoModel.create", () => {
    req.body = newTodo;
    TodoController.create(req, res, next);
    expect(TodoModel.create).toBeCalledWith(newTodo);
  });
});
```

ユニットテストでは大前提として、呼び出している外部の関数は正常に動作するものと仮定して、テスト対象になっているファイルの中で定義されている処理のみを確認することになっています。そこで

```javascript
TodoModel.create = jest.fn();
```

のように、外部の処理はモックにします。

reqはリクエスト、resはレスポンス、nextは処理が終わった後に呼び出されるcallbackです。expressの慣例に倣ったものですので特に説明は必要ないと思います。

beforeEach()は、読んで字のごとく、ここの処理を開始する前に必ず実行されるものを記述する箇所です。

そこでまず、HTTPで通知されたtodoの登録用データを使って、mongooseのデータ作成処理が実行されるのを確認しようとしているのがこちらの処理です。

```javascript
describe("TodoController.create", () => {

  it("should Call TodoModel.create", () => {
    req.body = newTodo;
    TodoController.create(req, res, next);
    expect(TodoModel.create).toBeCalledWith(newTodo);
  });
});
```

ここまででテストを実行しても、もちろんテストはパスしませんね。当たり前です。対応する処理を何も書いてないのですから。それでは、これを通すためには todo.controllerはどのようになっているべきでしょうか？

```javascript
const TodoModel = require("../model/todo.model");

exports.create = async (req, res, next) => {

  const createdModel = await TodoModel.create(req.body);

};
```

これでどうでしょう？以下にテスト実行結果を記録しましょう。

```
ここにJestのテスト結果をペーストする
```

はい。では、これで create処理は完成と言っていいでしょうか？今作っているのはREST APIのサーバーでしたよね。登録するためのデータを投げてきた相手に、登録ができたということを通知してあげる必要があるでしょう。と、するならば、それはどのような処理でしょうか？

一般的に、登録処理が成功した場合のHTTP Statusコードは「201」です。ここでは「201」を返却するのを期待動作としましょうか。テストに追加してみましょう。

```javascript
  it("should return 201 response code", async () => {
    await TodoController.create(req, res, next);
    expect(res.statusCode).toBe(201);
    expect(res._isEndCalled()).toBeTruthy();
  });
```

また、データを登録した時に個々に割り振られるIDを使うことで、この先に変更や削除が実行できるようになりますので、データ登録が成功したら、その登録したデータ自体も返却してもらうことにしましょう。

```javascript
  it("should return json body in response", async () => {
    TodoModel.create.mockReturnValue(newTodo);
    await TodoController.create(req, res, next);
    expect(res._getData()).toStrictEqual(newTodo);
  });
```

ではまた、これらをパスするために todo.controllerの方も変更してみましょう。

```javascript
const TodoModel = require("../model/todo.model");

exports.create = async (req, res, next) => {
  const createdModel = await TodoModel.create(req.body);
  res.status(201).send(createdModel); // ここを追加
};
```

どうでしょう？以下にテスト実行結果を記録しましょう。

```
ここにJestのテスト結果をペーストする
```

だいたいできましたね。ただ、もう１つ追加しておきたい処理があります。それは、例外処理です。常に正しいデータが送られてくるならいいですが、APIサーバに接続してくる相手は様々。意図しないデータが送られてきた時にも正しく動作しなければなりません。とすると、それはどんな処理になるでしょうか？

例えば必須プロパティであるStatusが存在しないデータがきた場合を考えてみましょう。この場合、mongooseがエラーを発見する形になるでしょう。ですから、TodoModel.createが返却してくるであろう戻り値を以下のようにモックしてみます。エラーを見つけた場合は、エラーメッセージごとcallbackに渡してしまうイメージですね。

```javascript
  it("shoul handle model validation errors", async () => {
    const errorMessage = { message: "status property missing" };
    const rejectedPromise = Promise.reject(errorMessage);
    TodoModel.create.mockReturnValue(rejectedPromise);
    await TodoController.create(req, res, next);
    expect(next).toBeCalledWith(errorMessage);
  });
```

では、これを実現するコードはどうなるでしょうか？

```javascript
const TodoModel = require("../model/todo.model");

exports.create = async (req, res, next) => {
  try { // 新規追加
    const createdModel = await TodoModel.create(req.body);
    res.status(201).send(createdModel);
  } catch (err) {　// 新規追加
    next(err);// 新規追加
  }// 新規追加
};
```

これでどうでしょう？以下にテスト実行結果を記録しましょう。

```
ここにJestのテスト結果をペーストする
```

テストコードを見ればわかりますが、これは例外が発生した時には常に同じ振る舞いになりますので、テストの中で使うメッセージとしては「"status property missing"」となっていますが、実際にはそれ以外のエラーについてもテストできていると言えるでしょう。

ということで、ユニットテストという意味ではここまでで１つ、完成したと言ってもいいでしょう。

しかしどうでしょう？まだテストとして物足りなくないでしょうか？例えば...

・TODOのタイトルや本文に文字数制限はつけないのか？
・DBに保存するところまでちゃんと確認すべきではないのか？

などというところは、ユニットテストでは確認できません。では、そういったところはどのように扱えばいいのでしょうか？

次のステップでは、他の機能と連携させた上でちゃんと動くか？という観点から確認を行う「インテグレーションテスト」について見てみることにしましょう。




