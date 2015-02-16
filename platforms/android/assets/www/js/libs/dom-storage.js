function domStorage(persist)
{
  try
  {
    var storage = window[persist ? 'localStorage' : 'sessionStorage'];
    if(!storage) { return null; }
  }
  catch(ex) { return null; }
 
  return {
 
    read : function(key)
    {
      return storage.getItem(key);
    }
 
    , write : function(key, value)
    {
      try
      {
        return storage[key] = value.toString();
      }
      catch(ex) { return null; }
    }
 
    , erase : function(key)
    {
      storage.removeItem(key);
      return true;
    }
 
    , keys : function()
    {
      for(var keys = [], n = storage.length, i = 0; i < n; i ++)
      {
        keys.push(storage.key(i));
      }
      return keys;
    }
 
    , clear : function()
    {
      try
      {
        storage.clear();
        return true;
      }
      catch(ex) { return false; }
    }
  };
}