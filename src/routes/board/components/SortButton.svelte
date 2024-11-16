<script>
    import FlipSortingIcon from "$lib/assets/swap_vert_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

    export let func;
    let ascendingOrder = false;

    function click() {
        ascendingOrder = !ascendingOrder;
        func(ascendingOrder);
    }
</script>


<button on:click={click}>
    <img src={FlipSortingIcon} alt="Flip sorting"/>
</button>


<style>
    button {
        border: none;
        background: none;
    }
    button:hover {
        background: none;
        cursor: pointer;
    }
    img {
        width: 75%;
        height: 75%;
        background: none;
    }
</style>