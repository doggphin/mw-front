<script>
    export let text = "default";
    export let iconSrc;
    export let link = "";
</script>


<a class="container noselect" href="{link}">
    <div class="image-container">
        <img src={iconSrc} alt="Nav Button Icon" />
    </div>
    <div class="text-container">
        <h3>{text}</h3>
    </div>
</a>    


<style>
    .container {
        display: flex;
        margin: 0px 10px 10px 10px;
        padding: 5px 20px 5px 0px;
        height: 40px;
        color: var(--text-color-1);
        border-radius: 15px;
        text-decoration: none;
    }
    .container:hover {
        background-color: var(--clr-primary-1-1);
    }
    .image-container {
        margin: auto 0px auto 15px;
    }
    .text-container {
        margin: auto 0 auto 0px;
        padding: 10px;
        white-space: nowrap;
        font-weight: 400;
    }
</style>