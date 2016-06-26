var textiled;
(function() {
	textiled = function(src,options) {
		var tc = new TextileConverter(src,options);
		return tc.convert();
	};

	function TextileConverter(src,options)
	{
		this.osrc = this.src = src;
		this.options = options || {};
		this.out = '';
		this.footnotes = [];
	}
	TextileConverter.prototype = {

		convert: function() {
			this.src = this.src.replace(/^\n+/,'');
			while( this.src.length )
			{
				for(var i=0;i<blockTypes.length;i++)
				{
					if(blockTypes[i].match.apply(this))
					{
						blockTypes[i].run.apply(this);
						break;
					}
				}
				if(i==blockTypes.length)
					throw(new Error("Error - couldn't match any block type for:\n\n"+this.src));

				this.out += '\n\n';
				this.src = this.src.replace(/^\n+/,'');
			}
			return this.out.trim();
		},

		getBlock: function() {
			var i = this.src.search('\n\n');
			if(i==-1)
				i=this.src.length;
			var block = this.src.slice(0,i).trim();
			this.src = this.src.slice(i+2);
			return block;
		},

		getLine: function() {
			var i = this.src.search('\n');
			if(i==-1)
				i = this.src.length;
			var line = this.src.slice(0,i).trim();
			this.src = this.src.slice(i+1);
			return line;
		},

		footnoteID: function(n) {
			if(!this.footnotes[n])
				this.footnotes[n] = 'fn'+(Math.random()+'').slice(2)+(new Date()).getTime();

			return this.footnotes[n];
		},

		convertSpan: function(span) {
			var nspan = [span];	//alternating bits that can be touched, and bits that should not change

			//do phrase modifiers
			for(var i=0;i<phraseTypes.length;i++)
			{
				for(var j=0;j<nspan.length;j+=2)
				{
					var res = phraseTypes[i].call(this,nspan[j]);
					if(res.length)
					{
						nspan[j] = '';
						nspan = this.joinPhraseBits(nspan,res,j+1);
					}
				}
			}

			//convert glyphs
			for(var i=0;i<nspan.length;i+=2)
			{
				nspan[i] = this.convertGlyphs(nspan[i]);
			}

			return nspan.join('');
		},

		joinPhraseBits: function(arr1,arr2,index)
		{
			if(!arr1.length)
				return arr2;
			index = Math.min(index,arr1.length)
			if(index % 2)
			{
				arr1[index-1] += arr2[0];
				arr2 = arr2.slice(1);
			}
			if(arr2.length % 2 && index<arr1.length &&  arr2.length>1)
			{
				arr1[index] += arr2[arr2.length-1];
				arr2 = arr2.slice(0,-1);
			}
			return arr1.slice(0,index).concat(arr2,arr1.slice(index));
		},

		convertGlyphs: function(txt) {
			for(var i=0;i<glyphRules.length;i++)
			{
				txt = txt.replace(glyphRules[i][0],glyphRules[i][1]);
			}
			//escape < and >
			var bits = txt.split(/(<[^<]+?>)/);
			for(var i=0;i<bits.length;i+=2)
			{
				bits[i] = bits[i].replace('<','&#60;').replace('>','&#62;');
			}
			txt = bits.join('');
			return txt;
		},

		makeTag: function(tagName,attr)
		{
			var open = '<'+tagName;
			for(var x in attr)
			{
				if(attr[x])
					open+=' '+x+'="'+attr[x]+'"';
			}
			var single = open+' />';
			open+='>';
			var close = '</'+tagName+'>';
			return {single: single, open: open, close: close, name: tagName};
		}
	};

	var para = TextileConverter.prototype.makeTag('p');

	var re_simpleTag = /<[^<]+?>/g;
	var re_punct = /[!"#$%&\'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;
	var glyphRules = [
		//[/\n(?! )/g,'<br />\n'],															//insert HTML newlines
		[/(\w)'(\w)/g,'$1&#8217;$2'],													//apostrophes
		[/(\s)'(\d+\w?)\b(?!')/g,'$1&#8217;$2'],											//abbreviated years ( '09 )
		[new RegExp("(\\S)'(?=\\s|"+re_punct.source+"|<|$)",'g'),'$1&#8217;'],				//single quote closing
		[/'/g,'&#8216;'],																//single quote opening
		[new RegExp('(\\S)"(?=\\s|'+re_punct.source+'|<|$)','g'),'$1&#8221;'],				//double quote closing
		[/"/g,'&#8220;'],																//double quote opening
		[/\b([A-Z][A-Z0-9]{2,})\b(?:\(([^\)]*)\))/g,'<acronym title="$2"><span class="caps">$1</span></acronym>'],	//acronym with a definition
		[/\b( ?)\.{3}/g,'$1&#8230;'],													//ellipsis
		[/(\s?)--(\s?)/g,'$1&#8212;$2'],													//em dash
		[/(\s?)-(?:\s|$)/g,' &#8211; '],													//en dash
		[/(\d)( ?)x( ?)(?=\d)/g,'$1$2&#215;$3'],											//times sign
		[/(?:^|\b)( ?)\(TM\)/gi,'$1&#8482;'],														//trademark sign
		[/(?:^|\b)( ?)\(R\)/gi,'$1&#174;'],														//registered trademark sign
		[/(?:^|\b)( ?)\(C\)/gi,'$1&#169;']															//copyright sign
	];

	//matches attribute modifier strings
	//use getAttributes to parse this into actual values
	/*
		/(
			(?:
				<|>|=|<>|												justification
				\(+(?!\w)|\)+|											padding
				(?:\([^\#\)]*(?:\#(?:[a-zA-Z]+[_a-zA-Z0-9-:.]*))?\))|	class & id
				\{.*?\}|												style
				\[.*?\]													language
			)*
		)/
	*/
	var re_attr = /((?:<|>|=|<>|\(+(?!\w)|\)+|(?:\([^#\)]*(?:#(?:[a-zA-Z]+[_a-zA-Z0-9-:.]*))?\))|\{.*?\}|\[.*?\])+)/;

	//get individual modifers from attribute strings
	var re_attrAlign = /<>|<|>|=/;
	re_attrAlign.values = {
		'<': 'left',
		'>': 'right',
		'<>': 'justify',
		'=': 'center'
	};
	var re_attrLeftPadding = /\(/g;
	var re_attrRightPadding = /\)/g;
	var re_attrClassId = /\(([^\(#\)]*)(?:#([a-zA-Z]+[_a-zA-Z0-9-:.]*))?\)/g;
	var re_attrClassIdSingle = new RegExp(re_attrClassId.source);	//only matches a single class/id modifier and gives back the class and id parts separately
	var re_attrStyle = /\{(.*?)\}/;
	var re_attrLanguage = /\[(.*?)\]/;

	//parse an attribute-modifier string into an attributes object
	function getAttributes(attr)
	{
		var opt = {
			style: ''
		};

		if(!attr)
			return opt;

		var paddingLeft=0, paddingRight=0;

		var m;

		if(m=re_attrStyle.exec(attr))
		{
			var style = m[1];
			if(style.length && !/;$/.test(style))
				style+=';'
			opt['style'] = style;
		}
		if(m=attr.match(re_attrLeftPadding))
		{
			paddingLeft += m.length;
		}
		if(m=attr.match(re_attrRightPadding))
		{
			paddingRight += m.length;
		}
		if(m=attr.match(re_attrClassId))
		{
			var n = m.length;
			for(var j=0;j<n && m[j].length==2;j++){}
			if(j<n)
			{
				m=re_attrClassIdSingle.exec(m[j]);
				if(m[1] || m[2])
				{
					paddingLeft -= (n-j);
					paddingRight -= (n-j);
				}
				if(m[1])
					opt['class'] = m[1];
				if(m[2])
					opt['id'] = m[2];
			}
		}
		if(m=re_attrLanguage.exec(attr))
		{
			opt['lang'] = m[1];
		}
		if(paddingLeft>0)
			opt['style'] += 'padding-left:'+paddingLeft+'em;';
		if(paddingRight>0)
			opt['style'] += 'padding-right:'+paddingRight+'em;';
		if(m=re_attrAlign.exec(attr))
		{
			opt['style'] += 'text-align:'+re_attrAlign.values[m[0]]+';';
		}

		return opt;
	}


	//array containing all the phrase modifiers
	//Contains functions which each replace a particular phrase modifier with the appropriate HTML
	//Functions are called with respect to the TextileConvertor object, so can use things like this.makeTag
	var phraseTypes = textiled.phraseTypes = [];

	var shortPunct = '\\.,"\'?!;:';
	function makeNormalPhraseType(start,tagName,protectContents)
	{
		var re = new RegExp('(?:^|\\{|\\[|(['+shortPunct+']|\\s|>))'+start+'(?:'+re_attr.source+' ?)?([^\\s'+start+']+|\\S[^'+start+'\\n]*[^\\s'+start+'\\n])'+start+'(?:$|[\\]}]|('+re_punct.source+'{1,2}|\\s))','g');
		return function(text) {
			var out = [];
			var m;
			while(m=re.exec(text))
			{
				var pre = m[1] || '';
				var post = m[4] || '';
				var attr = getAttributes(m[2]);
				var tag = this.makeTag(tagName,attr);
				var bit = [text.slice(0,m.index)+pre,post];
				if(protectContents)
				{
					var content = this.escapeHTML(m[3]);
					bit.splice(1,0,tag.open+content+tag.close);
				}
				else
					bit.splice(1,0,tag.open,m[3],tag.close);
				out = this.joinPhraseBits(out,bit,out.length);
				text = text.slice(re.lastIndex);
				re.lastIndex = 0;
			};
			if(out.length)
				out[out.length-1]+=text;
			return out;
		};
	}

	phraseTypes.push(makeNormalPhraseType('\\*\\*','b'));
	phraseTypes.push(makeNormalPhraseType('__','i'));
	phraseTypes.push(makeNormalPhraseType('\\*','strong'));
	phraseTypes.push(makeNormalPhraseType('_','em'));
	phraseTypes.push(makeNormalPhraseType('\\?\\?','cite'));
	phraseTypes.push(makeNormalPhraseType('\\-','del'));
	phraseTypes.push(makeNormalPhraseType('\\+','ins'));
	phraseTypes.push(makeNormalPhraseType('\\%','span'));
	phraseTypes.push(makeNormalPhraseType('~','sub'));
	phraseTypes.push(makeNormalPhraseType('\\^','sup'));

	var re_codePhrase = /(?:^|([\s(>])|\[|\{)@(.*?)@(?:([\s)])|$|\]|\})?/gm;
	phraseTypes.push(function(text) {
		var out = [];
		var m;
		while(m=re_codePhrase.exec(text))
		{
			var pre = m[1] || '';
			var post = m[3] || '';
			var bit = [text.slice(0,m.index)+pre,'<code>'+this.escapeHTML(m[2])+'</code>',post];
			out = this.joinPhraseBits(out,bit,out.length);
			text = text.slice(re_codePhrase.lastIndex);
			re_codePhrase.lastIndex = 0;
		}
		if(out.length)
			out[out.length-1] += text;
		return out;
	});

	var re_noTextilePhrase = /(?:^|([\s(>])|\[|\{)==(.*?)==(?:([\s)])|$|\]\})?/gm;
	phraseTypes.push(function(text) {
		var out = [];
		var m;
		while(m=re_noTextilePhrase.exec(text))
		{
			var pre = m[1] || '';
			var post = m[3] || '';
			var bit = [text.slice(0,m.index)+pre,m[2],post];
			out = this.joinPhraseBits(out,bit,out.length);
			text = text.slice(re_noTextilePhrase.lastIndex);
			re_noTextilePhrase.lastIndex = 0;
		}
		if(out.length)
			out[out.length-1] += text;
		return out;
	});

	var re_link = /(?:^|([\s(>])|\[|\{)"(.*?)(?:\((.*)\))?":(\S+?)(?:$|([\s),!?;]|\.(?:$|\s))|\]|\})/g;
	phraseTypes.push(function(text) {
		var out = [];
		var m;
		while(m=re_link.exec(text))
		{
			var pre = m[1] || '';
			var post = m[5] || '';
			var attr = {
				href: m[4],
				title: m[3]
			};
			var tag = this.makeTag('a',attr);
			var bit = [text.slice(0,m.index)+pre,tag.open,m[2],tag.close,post];
			out = this.joinPhraseBits(out,bit,out.length);
			text = text.slice(re_link.lastIndex);
			re_link.lastIndex = 0;
		}
		if(out.length)
			out[out.length-1] += text;
		return out;
	});

	var re_image = /(?:^|([\s(>])|\[|\{)!(.*?)(?:\((.*)\))?!(?::(\S+))?(?:$|([\s)])|\]|\})/g;
	phraseTypes.push(function(text) {
		var out = [];
		var m;
		while(m=re_image.exec(text))
		{
			var pre = m[1] || '';
			var post = m[5] || '';
			var attr = {
				src: m[2],
				title: m[3],
				alt: m[3]
			};
			var img = this.makeTag('img',attr).single;
			if(m[4])
			{
				var tag = this.makeTag('a',{href:m[4]});
				img = tag.open+img+tag.close;
			}
			var bit = [text.slice(0,m.index)+pre,img,post];
			out = this.joinPhraseBits(out,bit,out.length);
			text = text.slice(re_image.lastIndex);
			re_image.lastIndex = 0;
		}
		if(out.length)
			out[out.length-1] += text;
		return out;
	});

	var re_footnotePhrase = /(^|\S)\[(\d+)\]([\s\.,;:?!'"]|$)/g;
	phraseTypes.push(function(text) {
		var out = [];
		var m;
		while(m=re_footnotePhrase.exec(text))
		{
			var pre = m[1] || '';
			var post = m[3] || '';
			var fn = this.footnoteID(m[2]);
			var tag = this.makeTag('a',{href:'#'+fn});
			var bit = [text.slice(0,m.index)+pre,'<sup class="footnote">'+tag.open+m[2]+tag.close+'</sup>',post];
			out = this.joinPhraseBits(out,bit,out.length);
			text = text.slice(re_footnotePhrase.lastIndex);
			re_footnotePhrase.lastIndex = 0;
		}
		if(out.length)
			out[out.length-1] += text;
		return out;
	});

	var re_codeHTMLPhrase = /<code>((?:.|\n)*?)<\/code>/gm;
	phraseTypes.push(function(span) {
		var m;
		var nspan = [];
		while(m=re_codeHTMLPhrase.exec(span))
		{
			var bit = span.slice(0,m.index);
			var tag = '<code>'+this.escapeHTML(m[1])+'</code>';
			span = span.slice(re_codeHTMLPhrase.lastIndex);
			bit = this.convertGlyphs(bit);
			nspan = this.joinPhraseBits(nspan,[bit,tag],nspan.length+1);
			re_codeHTMLPhrase.lastIndex = 0;
		}
		if(nspan.length)
			nspan.push(span);
		return nspan;
	});

	var re_notextileHTMLPhrase = /<notextile>((?:.|\n)*?)<\/notextile>/gm;
	phraseTypes.push(function(span) {
		var m;
		var nspan = [];
		while(m=re_notextileHTMLPhrase.exec(span))
		{
			var bit = span.slice(0,m.index);
			var tag = m[1];
			span = span.slice(re_notextileHTMLPhrase.lastIndex);
			bit = this.convertGlyphs(bit);
			nspan = this.joinPhraseBits(nspan,[bit,tag],nspan.length+1);
			re_notextileHTMLPhrase.lastIndex = 0;
		}
		if(nspan.length)
			nspan.push(span);
		return nspan;
	});

	var re_capsPhrase = /<span class="caps">([A-Z][A-Z'\-]+[A-Z])<\/span>|\b([A-Z][A-Z'\-]+[A-Z])(?=[\s.,\)>]|$)/gm;
	phraseTypes.push(function(span) {
		var m;
		var nspan = [];
		while(m = re_capsPhrase.exec(span))
		{
			var bit = span.slice(0,m.index);
			span = span.slice(re_capsPhrase.lastIndex);
			bit = this.convertGlyphs(bit);
			var tag = m[1] ? m[0] : '<span class="caps">'+m[2]+'</span>';
			nspan = this.joinPhraseBits(nspan,[bit,tag],nspan.length+1);
			re_capsPhrase.lastIndex = 0;
		}
		if(nspan.length)
			nspan.push(span);
		return nspan;
	});

	//separate out HTML tags so they don't get escaped
	//this should be the last phrase type
	phraseTypes.push(function(span) {
		var m;
		var nspan = [];
		while(m = re_simpleTag.exec(span))
		{
			var bit = span.slice(0,m.index);
			var tag = span.slice(m.index,re_simpleTag.lastIndex);
			span = span.slice(re_simpleTag.lastIndex);
			bit = this.convertGlyphs(bit);
			nspan = this.joinPhraseBits(nspan,[bit,tag],nspan.length+1)
			re_simpleTag.lastIndex = 0;
		}
		if(nspan.length)
			nspan.push(span);
		return nspan;
	});

	// array containing all block types.
	// Contains objects of the form
	//	{
	//		match: function()			//returns true if source begins with this kind of block
	//		run: function()				//perform appropriate conversion on the block
	//	}
	// the functions are applied in the context of the TextileConverter object, so read in from this.src and output to this.out
	// the 'run' function should remove the block it converted from this.src
	// if you're adding another block type, add it to the start of this array
	var blockTypes = textiled.blockTypes = [];


	var re_anyBlock = new RegExp('^[a-zA-Z][a-zA-Z0-9]*'+re_attr.source+'?\\.+ ');

	var re_list = new RegExp('^(#+|\\*+)'+re_attr.source+'? ');
	var listItem = TextileConverter.prototype.makeTag('li');
	var list = {
		match: function() { return re_list.test(this.src); },
		run: function() {
			var m;
			var listType = '';
			var tags = [], level=0, tag, listType='';
			while(m = this.src.match(re_list))
			{
				var m = this.src.match(re_list);
				var listType = m[1];
				var tagName = listType[0]=='#' ? 'ol' : 'ul';
				var llevel = listType.length;

				while(llevel < level)
				{
					this.out += listItem.close+'\n'+tag.close;
					var o = tags.pop() || {level: 0};
					level = o.level;
					tag = o.tag;
				}
				if(llevel == level && tag && tagName != tag.name)
				{
					this.out += tag.close+listItem.close+'\n';
					var o = tags.pop() || {level: 0};
					level = o.level;
					tag = o.tag;
				}
				//definitely in a state where either current line is deeper nesting or same level as previous <li>
				
				if(level > 0)
				{
					if(llevel == level)
						this.out += listItem.close;
					this.out+='\n'
				}
				if(llevel > level || m[2])
				{
					if(tag)
						tags.push({level: level, tag: tag});
					var attr = getAttributes(m[2]);
					tag = this.makeTag(tagName,attr);
					level = llevel;
					this.out +=tag.open+'\n';
				}
				this.src = this.src.slice(m[0].length);
				var line = this.getLine();
				line = this.convertSpan(line);
				this.out += listItem.open+line;
			}
			this.out += listItem.close+'\n';
			while(tags.length)
			{
				this.out +=tag.close+listItem.close+'\n';
				tag = tags.pop().tag;
			}
			this.out += tag.close;
		}
	};
	blockTypes.push(list);

	var re_table = new RegExp('^(table'+re_attr.source+'?\. *\\n)?(('+re_attr.source+'?\\. )?\\|.*\\|\\n?)+(?:\\n\\n|$)');
	var re_tableRow = new RegExp('^(?:'+re_attr.source+'?\\. )?\\|.*\\|(?:\\n|$)');
	var re_tableCell = new RegExp('^(_)?(\\^|-|~)?(?:\\\\(\\d+))?(?:/(\\d+))?'+re_attr.source+'?\\. ');
	var table = {
		match: function() { return re_table.test(this.src); },
		run: function() {
			var m = re_table.exec(this.src);
			var tableTag;
			if(m[1])
			{
				var attr = getAttributes(m[2]);
				tableTag = this.makeTag('table',attr);
				this.getLine();
			}
			else
				tableTag = this.makeTag('table');
			this.out += tableTag.open+'\n';

			while(m = re_tableRow.exec(this.src))
			{
				var rowTag;
				if(m[1])
				{
					attr = getAttributes(m[1]);
					rowTag = this.makeTag('tr',attr);
				}
				else
					rowTag = this.makeTag('tr');
				this.out += rowTag.open+'\n';
				var line = this.getLine();
				var cells = line.split('|');
				var l = cells.length;
				for(var i=1;i<l-1;i++)
				{
					var cell = cells[i];
					if(m = re_tableCell.exec(cell))
					{
						cell = cell.slice(m[0].length);
						attr = getAttributes(m[5]);
						var tagName = m[1] ? 'th' : 'td';
						switch(m[2])
						{
						case '^':
							attr['style']+='vertical-align:top;';
							break;
						case '-':
							attr['style']+='vertical-align:middle;';
							break;
						case '~':
							attr['style']+='vertical-align:bottom;';
							break;
						}
						if(m[3])
							attr['colspan'] = m[3];
						if(m[4])
							attr['rowspan'] = m[4];

						var tag = this.makeTag(tagName,attr);
					}
					else
					{
						tag = this.makeTag('td');
					}
					cell = this.convertSpan(cell);
					this.out += tag.open+cell+tag.close+'\n';
				}
				this.out+=rowTag.close+'\n';
			}
			this.out += tableTag.close;
		}
	};
	blockTypes.push(table);

	var re_footnote = new RegExp('^fn(\\d+)'+re_attr.source+'?\\.(\\.)? ');
	var footnote = {
		match: function() { return re_footnote.test(this.src); },
		run: function() {
			var m = this.src.match(re_footnote);
			var n = parseInt(m[1]);
			var attr = getAttributes(m[2]);
			attr.id = this.footnoteID(n);
			attr['class'] = 'footnote';
			var tag = this.makeTag('p',attr);
			var carryon = m[3]!=undefined;

			this.src = this.src.slice(m[0].length);
			var block = this.getBlock();
			block = this.convertSpan(block);
			this.out += tag.open+'<sup>'+n+'</sup> '+block+tag.close;

			if(carryon)
			{
				while(this.src.length && !re_anyBlock.test(this.src))
				{
					var block = this.getBlock();
					block = this.convertSpan(block);
					this.out += '\n'+tag.open+block+tag.close;
				}
			}
		}
	};
	blockTypes.push(footnote);

	var re_blockquote = new RegExp('^bq'+re_attr.source+'?\\.(\\.)?(?::(\\S+))? ');
	var blockquote = {
		match: function() { return re_blockquote.test(this.src); },
		run: function() {
			var m = this.src.match(re_blockquote);
			var attr = getAttributes(m[1]);
			var tag = this.makeTag('p',attr);
			if(m[3])
				attr.cite = m[3];
			var btag = this.makeTag('blockquote',attr);
			var carryon = m[2]!=undefined;

			this.src = this.src.slice(m[0].length);
			var block = this.getBlock();
			block = this.convertSpan(block);
			this.out += btag.open+'\n'+tag.open+block+tag.close;

			if(carryon)
			{
				while(this.src.length && !re_anyBlock.test(this.src))
				{
					var block = this.getBlock();
					block = this.convertSpan(block);
					this.out += '\n'+tag.open+block+tag.close;
				}
			}
			this.out += '\n'+btag.close;
		}
	};
	blockTypes.push(blockquote);

	var re_blockcode = new RegExp('^bc'+re_attr.source+'?\\.(\\.)? ');
	var blockcode = {
		match: function() { return re_blockcode.test(this.src);},
		run: function() {
			var m = this.src.match(re_blockcode);
			var attr = getAttributes(m[1]);
			var tag = this.makeTag('code',attr);
			if(m[3])
				attr.cite = m[3];
			var btag = this.makeTag('pre',attr);
			var carryon = m[2]!=undefined;

			this.src = this.src.slice(m[0].length);
			var block = this.getBlock();
			block = this.escapeHTML(block);
			this.out += btag.open+tag.open+block+'\n'+tag.close;

			if(carryon)
			{
				while(this.src.length && !re_anyBlock.test(this.src))
				{
					var block = this.getBlock();
					block = this.escapeHTML(block);
					this.out += '\n'+tag.open+block+'\n'+tag.close;
				}
			}
			this.out += btag.close;
		}
	};
	blockTypes.push(blockcode);

	var re_pre = new RegExp('^pre'+re_attr.source+'?\.(\.)? ');
	var preBlock = {
		match: function() { return re_pre.test(this.src);},
		run: function() {
			var m = re_pre.exec(this.src);
			this.src = this.src.slice(m[0].length);
			var attr = getAttributes(m[1]);
			var tag = this.makeTag('pre',attr);
			var carryon = m[2]!=undefined;


			var block = this.getBlock();

			if(carryon)
			{
				while(this.src.length && !re_anyBlock.test(this.src))
				{
					block += '\n\n' + this.getBlock();
				}
			}
			block = this.escapeHTML(block);
			
			this.out += tag.open+block+'\n'+tag.close;
		}
	};
	blockTypes.push(preBlock);

	var re_notextile = new RegExp('^notextile'+re_attr.source+'?\.(\.)? ');
	var notextile = {
		match: function() {return re_notextile.test(this.src);},

		run: function() {
			var m = this.src.match(re_notextile);
			var carryon = m[2]!=undefined;

			this.src = this.src.slice(m[0].length);
			var block = this.getBlock();
			this.out += block;

			if(carryon)
			{
				while(this.src.length && !re_anyBlock.test(this.src))
				{
					var block = this.getBlock();
					this.out += '\n\n'+block;
				}
			}
		}
	}
	blockTypes.push(notextile);

	//normal block modifiers
	var blocks = ['h1','h2','h3','h4','h5','h6','p','div'];
	//add in any other normal block types here
	var re_block = new RegExp('^('+blocks.join('|')+')'+re_attr.source+'?.(.)? ');
	var normalBlock = {
		match: function() {return re_block.test(this.src);},

		run: function() {
			var m = this.src.match(re_block);
			var tagName = m[1];
			var attr = getAttributes(m[2]);
			var tag = this.makeTag(tagName,attr);
			var carryon = m[3]!=undefined;

			this.src = this.src.slice(m[0].length);
			var block = this.getBlock();
			block = this.convertSpan(block);
			this.out += tag.open+block+tag.close;

			if(carryon)
			{
				while(this.src.length && !re_anyBlock.test(this.src))
				{
					var block = this.getBlock();
					block = this.convertSpan(block);
					this.out += '\n'+tag.open+block+tag.close;
				}
			}
		}
	}
	blockTypes.push(normalBlock);

	var re_preHTML = /^<pre((?:\s+\w+(?:\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>((?:.|\n(?!\n))*)<\/pre>(?:\n\n|$)/;
	var preHTMLBlock = {
		match: function() { return re_preHTML.test(this.src);},
		run: function() {
			var m = re_preHTML.exec(this.src);
			this.src = this.src.slice(m[0].length);

			var attr = m[1];
			var code = this.escapeHTML(m[2]);
			this.out += '<pre'+attr+'>'+code+'</pre>';
		}
	};
	blockTypes.push(preHTMLBlock);


	var re_html = /^<(\w+)((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)>(.|\n(?!\n))*<\/\1>(\n\n|$)/;
	var inlineTags = 'a abbr acronym b bdo big br cite code dfn em i img input kbd label q samp select small span strong sub sup textarea tt var notextile'.split(' ');
	var htmlBlock = {
		match: function() { 
			var m = this.src.match(re_html); 
			if(m)
				return inlineTags.indexOf(m[1])==-1;
		},
		run: function() {
			var html = re_html.exec(this.src)[0].trim();
			this.src = this.src.slice(html.length);
			this.out += html;
		}
	};
	blockTypes.push(htmlBlock);

	var nowrapBlock = {
		match: function() { return this.src.match(/^ /); },
		run: function() {
			var block = this.getBlock();
			block = this.convertSpan(block);
			this.out += block;
		}
	};
	blockTypes.push(nowrapBlock);

	var plainBlock = {
		match: function() { return true;},
		run: function() {
			var block = this.getBlock();
			block = this.convertSpan(block);
			if(!this.options.nowrapPlainBlocks)
				block = para.open + block + para.close;
			this.options.nowrapPlainBlocks = false;
			this.out += block;
		}
	}
	blockTypes.push(plainBlock);

	//HTML characters should be escaped
	var htmlEscapes = [
		'&', '&#38;',
		'<', '&#60;',
		'>', '&#62;',
		"'", '&#39;',
		'"', '&#34;'
	]
	for(var i=0;i<htmlEscapes.length;i+=2)
	{
		htmlEscapes[i] = new RegExp(htmlEscapes[i],'g');
	}
	TextileConverter.prototype.escapeHTML = function(html)
	{
		for(var i=0;i<htmlEscapes.length;i+=2)
		{
			html = html.replace(htmlEscapes[i],htmlEscapes[i+1]);
		}
		return html;
	}
	//exports.parse = textiled;
})();




/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

// 次のtextileに渡す為に、ここでは改行のみ入れる
Renderer.prototype.paragraph = function(text) {
  //return '<p>' + text + '</p>\n';
  return text + '\n\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {

  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

function get_markuped(src, opt, callback){
    var markuped_val = '';
    // 最初にmarkdownを適用
    markuped_val = marked($org.val()).replace('&gt;','>');

    // 次にtextileを適用
    return textiled(markuped_val);

}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;
marked.get_markuped = get_markuped;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());



