# Todoアプリを作りながらTDDを学ぼう - APIサーバ編 Phase4 -

さて、本格的に作業を始める前に、１つやっておくことがありました。
テストを実施する上で必要になる２つのパッケージをインストールしましょう。

まず１つ目は、TODOのデータモデルを定義するための mongooseです。

```
npm install mongoose --save
```

それから次に、HTTP通信部分をモックしてくれる node-mocks-http を入れます。todo.controllerは、HTTP通信で取得したデータを受け取った後の部分の処理を担当するわけですので、その通信で受け取ったと想定されるデータを引き渡してくれる相手を擬似的に作り出してあげる必要があります。

```
npm install node-mocks-http
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

練習としてこのように例示しましたが、もちろん statusの情報内容を別のものに変更したり、画像などの他の情報を持たせるように変えてもらっても構いません。

つづく
