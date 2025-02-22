<script lang="ts" context="module">
	const formatter = Intl.DateTimeFormat('en-Ca', {
		year: 'numeric',
		month: '2-digit',
		day: 'numeric',
		hour: '2-digit',
		minute: 'numeric',
		second: 'numeric',
		hour12: false,
		timeZone: 'Asia/Shanghai'
	});

	function format(date: Date) {
		return formatter.format(date).replace(', ', ' ');
	}
</script>

<script lang="ts">
	export let value: Date | number | string;

	let date: Date;
	$: {
		if (typeof value === 'string') {
			date = new Date(value);
		} else if (typeof value === 'number') {
			date = new Date(value);
		} else {
			date = value;
		}
	}
</script>

<time datetime={date.toISOString()}>{format(date)}</time>
