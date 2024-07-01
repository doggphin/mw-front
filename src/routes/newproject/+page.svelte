<script>
    import SetNavName from '$lib/components/SetNavName.svelte';
    import ListContainer from '$lib/components/ListContainer.svelte';

    import { Canvas } from '@threlte/core';
    import Scene from './Scene.svelte';

    let height = 0;

    let [fromSlides, fromPrints, fromNegatives] = Array(3).fill(false);
</script>
<SetNavName name="New Project"/>

<ListContainer>
    <div style="display: flex; justify-content: center;">
        <div class="switch">
            <div style="display: flex; justify-content: center;"> Test </div>
            <div style="display: flex; justify-content: center;"> Test 2 </div>
        </div>
    </div>
</ListContainer>
<ListContainer>
    <p>Hello!</p>
    <p>Hello!</p>
</ListContainer>

<style>
    .switch {
        width: 200px;
        margin: 20px;
        position: relative;
        display: inline-grid;
        grid-template-columns: 50% 50%;
        border-radius: 20px;
        background-color: green;
    }
</style>