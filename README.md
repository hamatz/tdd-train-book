# Todoアプリを作りながらTDDを学ぼう - APIサーバ編 Phase3 -

TDDで作り始める。まずは形から。

１：　controllers フォルダを作り、その配下にロジックとして todo.controller.js を置きます。  
２：　１のファイルに対となるテストとして todo.controller.spec.js を test/unit 配下に置きます。  
　　　まずはUnitテストから作っていきます。  
３：　まずは、簡単に１つのコントローラーと、それをテストするための１つのSpecファイルという構成ができました。
　　　それでは、TDDとはどういうものなのか？実際にみていきましょう。  
４：　TDD。テスト駆動型設計というくらいですから、specとは仕様を記述するものですね。それでは、todo controllerはどのような仕様を満たすものでしょうか？　Todoのデータを扱うには、RESTの概念に置き換えると以下のような操作が必要となりますよね。  

　　・Create(C)
　　・Read(R)
　　・Update(U)
　　・Delete(D)

まずは、createから定義していきましょうか。create処理はどのような要件を満たすべきでしょう。難しいことを考える前に、まず、この処理は関数である、という大前提から始めてみましょう。  

```javascript
const TodoController = require("../../controllers/todo.controller");

describe("TodoController.create", () => {
  it("should have a createTodo function", () => {
    expect(typeof TodoController.create).toBe("function");
  });
});
```

さて、ここでJestを実行するとどうなるでしょう？

```
----------------------------|---------|----------|---------|---------|-------------------
File                        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------------|---------|----------|---------|---------|-------------------
All files                   |     100 |      100 |     100 |     100 |                   
 tdd-train-book             |     100 |      100 |     100 |     100 |                   
  sample.js                 |     100 |      100 |     100 |     100 |                   
 tdd-train-book/controllers |       0 |        0 |       0 |       0 |                   
  todo.controller.js        |       0 |        0 |       0 |       0 |                   
----------------------------|---------|----------|---------|---------|-------------------
Test Suites: 1 failed, 1 passed, 2 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        3.839 s
```

はい。controllerを一行も書いていないのだから、当然テストは失格になります。では、エラーにならないようにコードを書きましょうか。

```javascript
exports.create = () => {};
```

### 結果のサンプル

```
> NODE_ENV=development jest --coverage

 PASS  test/unit/todo.controller.spec.js
 PASS  test/sample.spec.js
----------------------------|---------|----------|---------|---------|-------------------
File                        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------------|---------|----------|---------|---------|-------------------
All files                   |     100 |      100 |      50 |     100 |                   
 tdd-train-book             |     100 |      100 |     100 |     100 |                   
  sample.js                 |     100 |      100 |     100 |     100 |                   
 tdd-train-book/controllers |     100 |      100 |       0 |     100 |                   
  todo.controller.js        |     100 |      100 |       0 |     100 |                   
----------------------------|---------|----------|---------|---------|-------------------

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        3.115 s
Ran all test suites.
```

はい。見事にパスしたようです。

このように、「先にあるべき仕様を定め、そのテストをパスするコードを書く」という作業を繰り返していくことで、ソフトウェアを完成させていくスタイルがTDDです。「テストを先に全部書ききるまではコードは書かない」といった流儀もあるようですが、我々の流儀としては、このようなスタイルをTDDと呼ぶことにします。