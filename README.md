# movefmt

```bash
# bash
movefmt () {
	local abs_path=$(realpath "$@") 
	npm --prefix ./path/to/movefmt run fmt -- "$abs_path"
}
```

```bash
$ movefmt ./sources/main.move
```