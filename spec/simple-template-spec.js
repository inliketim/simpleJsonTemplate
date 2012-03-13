﻿describe("when using simple template js : simpleTemplate.js", function () {
  var model;
  var templateUrl = "./templates/template.html";
  var target = $("<div />");

  beforeEach(function () {
    model = {
      Name: "Name",
      Stuff: "Some encoded data & stuff ~ ! # $ * ? ",
      Collection: [
        { Id: 1, Stuff: "stuff 1" },
        { Id: 2, Stuff: "stuff 2" }
      ]
    };

    spyOn(templateCache, "add").andCallThrough();

    simpleTemplate.renderJson(templateUrl, model, target);
  });

  it("should call template cache add", function () {
    expect(templateCache.add).toHaveBeenCalled();
  });

  it("should set html in the target", function () {
    expect(target.html()).not.toBeNull();
  });

  it("should render the h1 correctly", function () {
    expect($(target.find("h1")[0]).html()).toEqual("Some encoded data &amp; stuff ~ ! # $ * ? ");
  });

  it("should render the h3 correctly", function () {
    expect($(target.find("h3")[0]).html()).toEqual("Name");
  });

  it("should render the collection as li tags", function () {
    expect(target.find("li").length).toEqual(2);
  });

  it("should render the li tags with correct content", function () {
    expect($(target.find("li")[0]).html()).toEqual("Name 1 stuff 1");
    expect($(target.find("li")[1]).html()).toEqual("Name 2 stuff 2");
  });

  it("should render the li tags with correct ids", function () {
    expect($(target.find("li")[0]).attr("id")).toEqual("Name_1");
    expect($(target.find("li")[1]).attr("id")).toEqual("Name_2");
  });

  it("should should have added the template to the cache", function () {
    expect(templateCache.count()).toEqual(1);
  });

  describe("and the if condition is not satisfied", function () {
    beforeEach(function () {
      model.Name = "Joe";
      simpleTemplate.renderJson(templateUrl, model, target);
    });

    it("should not render the ul tag", function () {
      expect(target.find("ul").length).toEqual(0);
    });

    it("should not render the li tags", function () {
      expect(target.find("li").length).toEqual(0);
    });

    it("should use the cached template on subsequent calls", function () {
      expect(templateCache.count()).toEqual(1);
    });
  });
});