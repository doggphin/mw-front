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
    @media only screen and (max-width: 768px) {
        .container {
            justify-content: center;
            height: 40px;
            width: 40px;
            color: var(--text-color-1);
            border-radius: 15px;
            margin: auto 0 auto 10px;
            position: relative;
        }
        .image-container {
            position: absolute;
            width: 75%;
            height: 75%;
            margin: auto;
            top:0; right:0; bottom:0; left:0;
        }
        img {
            width: 100%;
            height: 100%;
        }
        .container:hover {
            background-color: var(--clr-primary-1-1);
        }
        .text-container {
            display: none;
        }
    }

    @media only screen and (min-width: 768px) {
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
    }
</style>