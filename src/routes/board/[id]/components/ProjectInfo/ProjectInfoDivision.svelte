<script>
    import ListContainerLineBreak from "$lib/components/ListContainerLineBreak.svelte";

    export let name;
</script>



<div style="margin-bottom: 5px;">
    <h3 style="text-decoration: underline;">{name}</h3>
</div>
<slot/>
<div style="margin-bottom: 10px;"/>