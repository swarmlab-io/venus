

wg genkey | tee ./privatekey | wg pubkey > ./publickey

privatekey=$(head -1 ./privatekey)
publickey=$(head -1 ./publickey)

jq --arg key0   'private' --arg private $privatekey --arg key1   'public' --arg public $publickey '. | .[$key0]=$private | .[$key1]=$public ' <<<'{}' | tee ./keys.json

