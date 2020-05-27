# Todoアプリを作りながらTDDを学ぼう - APIサーバ編 Phase2 -

Hello World的な感じでJestを使って簡単なテストを書いてみよう。

１：　用意されたテストを見てみよう（/test/sample.spec.js)  
２：　文字列”Hello”と入力された文字列とを連結する関数helloを定義してみよう  
３：　２のコードが１のテストを通過するか試してみよう  


### 結果のサンプル

```
> NODE_ENV=development jest

 PASS  test/sample.spec.js
  hello function
    ✓ concatinate hello and strings (3 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        2.404 s
Ran all test suites.
```
