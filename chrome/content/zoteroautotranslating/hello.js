	Zotero.AutoTranslator = {
		boolLog: true,
		boolActivated:true,
		boolInsertItem:'?',
		boolUpdateItem:'-',
		prefManager:null,
		notifierID :null,
		profile:[],
		active:null,
		init: function ()
			{
			this.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	    
            /*var translators = Zotero.Translators.getAllForType("web");
                      }*/
			try {
				//check whether we show debugs or not
				var temp = this.prefManager.getBoolPref("extensions.zoteroautotranslating.showdebug");
				if(temp==true)
					{
					this.boolLog=true;
					}
				var temp = this.prefManager.getBoolPref("extensions.zoteroautotranslating.deactivate");
				if(temp==true)
					{
					this.boolActivated=false;
					}
				//get the array of url profiles
				temp = JSON.parse(this.prefManager.getCharPref("extensions.zoteroautotranslating.jsonurl"));
				if(temp.length>0)
					{
					//okay we have urls
					this.profile=temp;
					if(this.boolActivated==true)
						{
						window.addEventListener('load', function () {    gBrowser.addEventListener('DOMContentLoaded', function (aEvent) { Zotero.AutoTranslator.check(aEvent); }, false) }, false);
						}
					else
						{
						this.log('Searching is not activated');
						}
					}
				else
					{
					this.log('No url profiles set');
					}
				}
			catch (err)
				{
				
				}
			},
		check: function(aEvent)
			{
			if(this.profile.length>0)
				{
				this.log('Searching profiles..');
				//var ul=window.content.location.href;
				 var arrParam=new Object();
				 arrParam['titel']=aEvent.target.title;
				 arrParam['url']=aEvent.target.location.href;
				 this.log(JSON.stringify(arrParam));
				for (var cz in this.profile)
					{
					var boolPass=0;
					
					for(strParam in arrParam)
						{
						this.log('value: '+this.profile[cz][strParam]);
						//when not isset then no problem
						if(this.profile[cz][strParam].length<1)
							{
							boolPass+=1;
							this.log(strParam+'  is not set..');
							continue;
							}
						//try regexp
						var tempregexp = new RegExp(this.profile[cz][strParam],'ig');
						var temp=tempregexp.test(arrParam[strParam]);
						if(temp==true)
							{
							this.log(strParam+' passed successfully the regexp test:'+arrParam[strParam]+'<>'+this.profile[cz][strParam]);
							boolPass+=1;
							}
						//try indexof in string
						else	if(arrParam[strParam].indexOf(this.profile[cz][strParam])>-1)
							{
							this.log(strParam+' passed successfully the stristr test:'+arrParam[strParam]+' contains '+this.profile[cz][strParam]);
							boolPass+=1;
							}
						}
					this.log('Profile gets '+boolPass+' points');
					if(boolPass==2)
						{
						this._start(cz,aEvent);
						return;
						}
					}
				}
		},
		itemDoneCallback: function(obj, item) 
					{
					this.log('Item Done Handler has started');
					
					if(this.profile[this.active]['field'].length<2 || typeof this.profile[this.active]['field']=='undefined' || this.profile[this.active]['field']=='false')
								{
								//no Value for Identify set and mode is insert
								if((typeof this.profile[this.active]['boolInsertItem']=='undefined' && this.boolInsertItem=='?') || this.profile[this.active]['boolInsertItem']!='-')
									{
									this.log('Identification field is empty or disabled. Items are added because insert mode is not to skipped new one!');
									Zotero_Browser.itemDone(obj, item, null);
									}
								}
							else
								{
								var search = new Zotero.Search(); 

								//now iterate through trough the identifier fields
								if(this.profile[this.active]['field'].indexOf(' ')>-1)
									{
									var arrIdents=this.profile[this.active]['field'].split(' ');
									for(var strIdent in arrIdents)
										{
										if(strIdent.indexOf('>')>-1)
											{
											
											}
										else
											{
											search.addCondition(strIdent, 'contains', item.getField(strIdent));
											}
										}
									}
								else
									{
									this.log('Single ident');
									search.addCondition(this.profile[this.active]['field'], 'contains', item.getField(this.profile[this.active]['field']));
									}

								 //search.addCondition('recursive', 'true');
								var results = search.search();
								var zuviel= Zotero.Items.get(results);
								//now modify propertys if something is found
								this.log(zuviel.length+' Elements found');
								if((zuviel.length>0))
										{
										for(intZuviel in zuviel)
											{
											
											if((typeof this.profile[this.active]['boolUpdateItem']=='undefined' && this.boolUpdateItem=='+') || this.profile[this.active]['boolUpdateItem']=='+')
												{
												this.log('Items property will replaced with the new ones');
												/*
												if(item.getType()!=zuviel[intZuviel].getType())
													{
													zuviel[intZuviel].setType(item.getType());
													}
												else
													this.log('Item type is okay and not changed');
												//merge the fields
												this.log('Merge fields of the item');
												var iType = item.getType();
												var fields = Zotero.ItemFields.getItemTypeFields(iType);
												for (var i=0; i<fields.length; i++) {
												  fieldName = Zotero.ItemFields.getName(fields[i]);
												  if(item.getField(fieldName)!='' && item.getField(fieldName)!=zuviel[intZuviel].getField(fieldName))
													{
													this.log('Update:'+fieldName+':'+zuviel[intZuviel].getField(fieldName)+'<>'+item.getField(fieldName));
													zuviel[intZuviel].setField(fieldName,item.getField(fieldName));
													}
												 else
													{
													this.log('No update:'+fieldName+':'+zuviel[intZuviel].getField(fieldName)+'<>'+item.getField(fieldName));
													}
												}
												//merge the tags
												this.log('Merge tags of the item');
												var arrTags=item.getTags();
												for (var i=0; i<arrTags.length; i++) {
													zuviel[intZuviel].addTag(arrTags[i].name);
													}
												this.log('Merge attachments');
												 var obj = item.serialize();
												*/
												if(item.id!=zuviel[intZuviel].id)
													{
													zuviel[intZuviel]=item.clone(false,zuviel[intZuviel],true);
													item.erase();
													zuviel[intZuviel].save();
													return true;
													}
												else
													{
													this.log('ID is the same:'+item.id);
													}
												zuviel[intZuviel].save();
												}
											else if((typeof this.profile[this.active]['boolUpdateItem']=='undefined' && this.boolUpdateItem=='?') || this.profile[this.active]['boolUpdateItem']=='?')
												{
												this.log('Item will merged with new one');
												var iType = item.getType();
												
												var fields = Zotero.ItemFields.getItemTypeFields(iType);
												for (var i=0; i<fields.length; i++) {
												  fieldName = Zotero.ItemFields.getName(fields[i]);
												  if(zuviel[intZuviel].getField(fieldName)=='' && item.getField(fieldName)!='')
													{
													this.log('Update:'+fieldName+':'+zuviel[intZuviel].getField(fieldName)+'<>'+item.getField(fieldName));
													zuviel[intZuviel].setField(fieldName,item.getField(fieldName));
													}
												 else
													{
													this.log('No update:'+fieldName+':'+zuviel[intZuviel].getField(fieldName)+'<>'+item.getField(fieldName));
													}
												}
												//merge the tags
												this.log('Merge tags of the item');
												var arrTags=item.getTags();
												for (var i=0; i<arrTags.length; i++) {
													zuviel[intZuviel].addTag(arrTags[i].name);
													}
													
												this.log('Merge the autors');
										
														var i = 0;
														for (var c in obj.creators) {
															var creator = this.getCreator(c).ref;
															var creatorTypeID = this.getCreator(c).creatorTypeID;
															
											
																var creatorDataID = Zotero.Creators.getDataID(this.getCreator(c).ref);
																var creatorIDs = Zotero.Creators.getCreatorsWithData(creatorDataID, newItem.libraryID);
																if (creatorIDs) {
																	
																	var creator = Zotero.Creators.get(creatorIDs[0]);
																}
																else {
																	var newCreator = new Zotero.Creator;
																	newCreator.libraryID = newItem.libraryID;
																	newCreator.setFields(creator);
																	var creator = newCreator;
																}
																
																var creatorTypeID = this.getCreator(c).creatorTypeID;
															}
														
													
													
												zuviel[intZuviel].save();
												}
											}
										}
										
										}
					/*				else if(zuviel.length>1)
										{
										this.log('More as one item with the identifier exists.. no property merge');
										}*/
								//now decide if add or not
								if((typeof this.profile[this.active]['boolInsertItem']=='undefined' && this.boolInsertItem=='+') || this.profile[this.active]['boolInsertItem']=='+')
								//always add
									{
									this.log('Identification field is set and  items are added because insert mode wants always to add');
									Zotero_Browser.itemDone(obj, item, null);
									}
								else if((typeof this.profile[this.active]['boolInsertItem']=='undefined' && this.boolInsertItem=='?') || this.profile[this.active]['boolInsertItem']=='?')
									{
									//add because it does not exist yet
									if((typeof zuviel.length =='undefined' ||zuviel.length<2))
										{
										this.log('Identification field is set and  items are added because mode is insert and the item was not found');
										Zotero_Browser.itemDone(obj, item, null);
										}
									else
										{
										this.log('Identification field is set and  items are not added because  item was found');
										item.erase();
										}
									}
								else if((typeof this.profile[this.active]['boolInsertItem']=='undefined' && this.boolInsertItem=='-') || this.profile[this.active]['boolInsertItem']=='-')
									{
									this.log('Identification field is set and  items are not added because mode do not allow to add new ones');
									item.erase();
									}
								else
									{
									this.log('Error no mode found..');
									}
								}
						
						,
		_start: function (profil,aEvent)
			{
			this.log('run for new profile');
			Zotero.AutoTranslator.active=profil;
			this._autotranslating(aEvent);
			},
		
		_autotranslating: function (aEvent)
			{
			//now try to run the translator
			this.log('Run autotranslating');
			try
				{
				//create the new web translator
				var translator = new Zotero.Translate.Web(); 
				
				//set the current document (we need no setLocation)
				//translator.setDocument(window.content.document); 
				translator.setDocument(aEvent.target); 
				
				//set a handler for a visible progress..
				translator.setHandler("itemDone", function (obj, item) 	{ Zotero.AutoTranslator.itemDoneCallback(obj,item); }); 
				
				
				//get the list of possible translators!
				var arrTranslators=translator.getTranslators(false);
				var temp=false;
				for each(var potentialTranslator in arrTranslators)
					{
					this.log('Potential translator: '+potentialTranslator.label+', '+potentialTranslator.creator+' ('+potentialTranslator.translatorID+')');
					//if no translator isset or translator is jokered we set the first..
					if(typeof Zotero.AutoTranslator.profile[Zotero.AutoTranslator.active]['translatorid']=='undefined' || Zotero.AutoTranslator.profile[Zotero.AutoTranslator.active]['translatorid']=='*')
						{
						translator.setTranslator(potentialTranslator.translatorID);
						this.log('Used the first translator because no translator was set for this profile!');
						temp=true;
						}
					if(Zotero.AutoTranslator.profile[Zotero.AutoTranslator.active]['translatorid']==potentialTranslator.translatorID || Zotero.AutoTranslator.profile[Zotero.AutoTranslator.active]['translatorid']==potentialTranslator.label)
						{
						translator.setTranslator(potentialTranslator.translatorID);
						this.log('Used the translator which was specified in the profile by name or id');
						temp=true;
						}
					}
				
				//and now transfer to Zotero!
				if(temp==true)
					{
					translator.translate();
				
					this.log('Translation finished');
					}
				else
					{
					this.log('No translator could found or the translator which was specified was not available');
					}
				}
			catch (err)
				{
				this.log('Error if trying translating');
				}
			},
		
		log: function (msg) {
		if(this.boolLog==true)
			{
			 var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		   consoleService.logStringMessage(msg);
		   }
    }
	};

Zotero.AutoTranslator.init();