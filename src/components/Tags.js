import React from 'react';

export default function Tags(props){
	const [tags, setTags] = React.useState(props.tags);

	React.useEffect(()=>{
		setTags([]);
	},[props.clear])

	const removeTags = indexToRemove => {
		setTags([...tags.filter((_, index) => index !== indexToRemove)]);
    };
	const addTags = event => {
        if(event.target.value.length < 10) return;
		if (event.target.value !== "") {
            if(event.key === "Enter" || event.key === " " || event.key === "," || event.target.value.length === 10){
                setTags([...tags, event.target.value.replace(' ', '').replace(',', '')]);
                props.selectedTags([...tags, event.target.value]);
                event.target.value = "";
            }
		}
	};
	const pasteTags = e => {
		const clipboardData = e.clipboardData || e.originalEvent.clipboardData || window.clipboardData;
		const _pastedData = clipboardData.getData('text');
		if (_pastedData) {
			const pastedData = _pastedData.replace(/ /g, ';').replace(/,/g, ';').replace(/\r\n/g,';')
			const arr = pastedData.split(';').filter(el => el.trim().length > 0);
			setTags([...tags, ...arr]);
			props.selectedTags([...tags, ...arr]);
			e.preventDefault();
		}
	}

	return (
		<div className="tags-input">
			<ul id="tags">
				{tags.map((tag, index) => (
					<li key={index} className="tag">
						<span className='tag-title'>{tag}</span>
						<span className='tag-close-icon'
							onClick={() => removeTags(index)}
						>
							x
						</span>
					</li>
				))}
			</ul>
			<input
				type="text"
				onFocus={props.savedMessageHandlerHide}
				onKeyUp={event => addTags(event)}
				onPaste={event => pasteTags(event)}
				placeholder="Enter recipients."
			/>
		</div>
	);
};
