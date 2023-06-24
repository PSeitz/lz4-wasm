

<div align="center">

  <h1><code>lz4-wasm</code></h1>

  <strong>Extremely fast compression(200MB/s Firefox, 350Mb/s Chrome) and decompression(600MB/s Firefox, 1400Mb/s Chrome) in the browser or nodejs using wasm.</strong>

</div>

## Benchmarks

Test it yourself here:
https://pseitz.github.io/lz4-wasm/

Input | Lib | Compression | Decrompression | Ratio 
| ---    | ---    | ---       | ---       | ---  
66k_JSON|	lz4 wasm|	292.43MB/s|	687.37MB/s|	0.23
66k_JSON|	lz4 js|	101.48MB/s|	27.06MB/s|	0.24
66k_JSON|	fflate|	24.21MB/s|	117.80MB/s|	0.17
65k Text|	lz4 wasm|	146.10MB/s|	610.59MB/s|	0.55
65k Text|	lz4 js|	73.55MB/s|	28.15MB/s|	0.56
65k Text|	fflate|	15.40MB/s|	63.83MB/s|	0.41
34k Text|	lz4 wasm|	159.57MB/s|	562.43MB/s|	0.57
34k Text|	lz4 js|	59.77MB/s|	28.10MB/s|	0.58
34k Text|	fflate|	15.53MB/s|	55.79MB/s|	0.41
1k Text|	lz4 wasm|	181.25MB/s|	362.50MB/s|	0.78
1k Text|	lz4 js|	2.18MB/s|	45.31MB/s|	0.77
1k Text|	fflate|	5.49MB/s|	3.64MB/s|	0.53

## 🚴 Usage

There are two npm packages:
* nodejs `lz4-wasm-nodejs` 
* browser `lz4-wasm`.

See usage examples in this repo for [browser](https://github.com/PSeitz/lz4-wasm/tree/main/example_project) and [nodejs](https://github.com/PSeitz/lz4-wasm/tree/main/example_project_nodejs)

The wasm module exposes two function compress and decompress.
Both accept and return UInt8Array. 
Internally the lz4 block api is used, the length of the original input is prepended in 32-bit little endian.
The wasm code is based on [lz4_flex](https://github.com/pseitz/lz4_flex)

```

import * as wasm from "lz4-wasm";

// use TextEncoder to get bytes (UInt8Array) from string
var enc = new TextEncoder();
const compressed = wasm.compress(enc.encode("compress this text, compress this text pls. thx. thx. thx. thx. thx"));
const original = wasm.decompress(compressed);

var dec = new TextDecoder("utf-8");
alert(dec.decode(original))

```





## Making New Releases

### Release for bundler

Build. This will optimize usage for inside a bundler like webpack.
```
RUST_LOG=info wasm-pack build --release
```

Due to a long standing bug in wasm-pack 0.9.1, _manually_ add these files to pkg/package.json.

```
    "lz4_wasm_bg.wasm.d.ts",
```

```
RUST_LOG=info wasm-pack publish
```


### Release for nodejs

set name in Cargo toml to
```
name = "lz4-wasm-nodejs"
```

Build for nodejs
```
RUST_LOG=info wasm-pack build --release -t nodejs
```

```
RUST_LOG=info wasm-pack publish
```
