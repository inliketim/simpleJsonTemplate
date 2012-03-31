﻿var simpleTemplate = (function () {
  var renderJson = function (url, data, target) {
    var template = templateCache.template(url);
    if (template != null) {
      $(target).html(templateController.renderTemplate(template, data));
      return;
    }

    $.ajax({
      async: false,
      cache: true,
      dataType: "html",
      type: "GET",
      url: url,
      success: function (result) {
        templateCache.add(url, result);
        $(target).html(templateController.renderTemplate(result, data));
      },
      error: function (xhr) {
        if (xhr.statusMessage != "error") {
          templateCache.add(url, xhr.responseText);
          $(target).html(templateController.renderTemplate(xhr.responseText, data));
          return;
        }
        $(target).html("Template " + url + " could not be loaded.");
      }
    });
  };

  return {
    renderJson: function (url, data, target) {
      renderJson(url, data, target);
    }
  };
})();

var templateController = (function () {
  var propertyTypes = {
    encoded: {
      key: "encoded",
      pattern: "\\$(\\{|(%7B))([^\\{(%7B)])*(\\}|(%7D))",
      specifier: "$"
    }
  };

  var renderProperties = function (propertyType, element, data, itemName) {
    var pattern = propertyType.pattern;
    var regEx = new RegExp(pattern, "g");
    var theHtml = decodeURIComponent(element.outerHtml());
    var properties = theHtml.match(regEx);

    for (var i = 0; i < properties.length; i++) {
      var propertyNameIsolator = new RegExp(/[\$\{\}]/gi);
      var propertyName = properties[i].replace(propertyNameIsolator, "").replace(itemName, "");
      var value = data[propertyName];
      if (value != undefined) {
        var replaceRegex = new RegExp(properties[i].replace("$", "\\$").replace("{", "\\{").replace("}", "\\}"), "g");
        theHtml = theHtml.replace(replaceRegex, value);
      }
    }

    element = $(theHtml);
    return element;
  };

  var renderEncodedProperties = function (dom, data) {
    return renderProperties(propertyTypes.encoded, dom, data, "");
  };

  var renderCollections = function (dom, data) {
    var collection = dom.find("*[data-foreach][data-in]");

    for (var i = 0; i < collection.length; i++) {
      var element = $(collection[i]);
      var collectionName = element.data("in");
      var itemName = element.data("foreach");

      var collectionData = data[collectionName];
      for (var j = 0; j < collectionData.length; j++) {
        var newElement = element.clone();
        newElement.removeAttr("data-foreach").removeAttr("data-in");
        newElement = renderProperties(propertyTypes.encoded, newElement, collectionData[j], itemName + ".");
        element.parent().append(newElement);
      }
      element.remove();
    }
    return dom;
  };

  var handleConditions = function (dom, data) {
    var conditions = dom.find("*[data-if]");
    for (var i = 0; i < conditions.length; i++) {
      var condition = $(conditions[i]).data("if");
      if (!eval("data." + condition)) {
        $(conditions[i]).remove();
      }
      $(conditions[i]).removeAttr("data-if");
    }
    return dom;
  };

  var renderTemplate = function (template, data) {
    // prevent template from firing potential 404s by attempting to load resources when initially added to dom
    template = template.replace(" src=", " src_temp_disabled=");

    var dom = $(template);
    dom = handleConditions(dom, data);
    dom = renderEncodedProperties(dom, data);
    dom = renderCollections(dom, data);

    dom = $(dom.outerHtml().replace(" src_temp_disabled=", " src="));
    return dom.outerHtml();
  };

  return {
    renderTemplate: function (template, data) {
      return renderTemplate(template, data);
    }
  };
})();

var templateCache = (function () {
  var cache = [];

  var add = function (key, value) {
    cache.push({ key: key, value: value });
  };

  var template = function (key) {
    for (var i = 0; i < cache.length; i++) {
      if (cache[i].key == key)
        return cache[i].value;
    }
    return null;
  };

  var exists = function (key) {
    for (var i = 0; i < cache.length; i++) {
      if (cache[i].key == key)
        return true;
    }
    return false;
  };

  return {
    add: function (key, value) {
      if (!exists(key))
        return add(key, value);
      return false;
    },
    template: function (key) {
      return template(key);
    },
    count: function () {
      return cache.length;
    }
  };
})();
