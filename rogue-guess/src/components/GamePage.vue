<template>
    <div id="background"></div>
    <div class="container">
        <div class="theme" id="theme"></div>
        <div class="turn-info" id="turn-info"></div>
        <div class="timer" id="timer"></div>
        <div class="center">
            <label for="game-input" class="sr-only">Entrer un texte :</label>
            <input type="text" id="game-input" placeholder="...">
        </div>
        <div class="player-list" id="player-list"></div>
    </div>
    <div class="victory-message" id="victory-message">
        <div id="victory-username"></div>
        <div id="winners-container" class="winners-container"></div>
    </div>
    <div class="losers-container" id="losers-container"></div>
</template>

<script>
</script>

<style>
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}
</style>
