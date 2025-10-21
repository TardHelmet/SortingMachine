<script>
	import '../app.css';
</script>

<main>
	<slot />
</main>

<style>
	:global(body) {
		background: #000000;
		color: #FFFFFF;
		margin: 0;
		padding: 0;
		min-height: 100vh;
	}

	main {
		background: #000000;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
