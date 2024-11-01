<script>
    import { widthConsts } from "../widthConsts.js";

    export let groupData, name, widthName;

    let width = widthConsts[widthName];
</script>


<div style="flex: {width} 0 {width}rem;">
    {groupData[name]}
</div>