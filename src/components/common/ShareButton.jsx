export default function ShareButton({ product = {},url }) {
    let { titile } = product

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    return (
        <div className={"share-btns"} >
            <button onClick={() => navigator.share ? navigator.share({ name:titile, text: name, url }) : copyLink()}>
                <i class="fa-solid fa-share"></i>
            </button>
        </div>
    );
}
