# moleskine [![Build Status](https://travis-ci.org/ricardomatias/moleskine.svg)](https://travis-ci.org/ricardomatias/moleskine)

> Write notes as you develop, with or without encryption. (CLI)

## Requirements

* node.js

## CLI

```
npm install -g moleskine
```

```cli
moleskine w refactor edit diagram feature
Create .moleskine with encryption ? (y/n)
> y
Write the secret you want to encrypt with:
(Text Input hidden)
>
Please confirm the secret
>
Saved to .moleskine

moleskine open
What's the secret ?
>
refactor edit diagram feature
```

### Flags

* `secret` - The secret used to encrypt the file

## License

MIT © Ricardo Matias
