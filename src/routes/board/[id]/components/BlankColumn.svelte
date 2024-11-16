<script>
    import { widthConsts } from "../widthConsts.js";

    export let widthName = null;

    let width = widthConsts[widthName];
</script>


<div style="flex: {width} 0 {width}rem;"/>


<style>
    div {
        height: 20px;
    }
</style>