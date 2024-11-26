<script>
    import { widthConsts } from "$lib/components/columns/widthConsts.js";

    export let groupData, colName, widthName;

    let width = widthConsts[widthName];
</script>


<div style="flex: {width} 0 {width}rem;">
    {groupData[colName]}
</div>