const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("Post", () => {

    beforeEach((done) => {
        this.topic;
        this.post;
        sequelize.sync({force: true}).then((res) => {

            Topic.create({
                title: "National Parks",
                description: "A compilation of national parks."
            })
            .then((topic) => {
                this.topic = topic;

                Post.create({
                    title: "Yellowstone National Park",
                    body: "Visit Yellowstone and experience the world's first national park",
                    topicId: this.topic.id
                })
                .then((post) => {
                    this.post = post;
                    
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
                
                done();
            });
        });
        
    });

    describe("#create()", () => {

        it("should create a topic object with a title and description", (done) => {

            Topic.create({
                title: "National Parks",
                description: "A compilation of National Parks."
            })
            .then((topic) => {
                expect(topic.title).toBe("National Parks");
                expect(topic.description).toBe("A compilation of National Parks.");
            
                done();
            })
            .catch((err) => {
                console.log(err);
                
                done();
            });
        });

        it("should not create a topic with missing title or description", (done) => {
            
            Topic.create({
                title: "National Parks",
                description: "A compilation of National Parks."
            })
            .then((topic) => {
       
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Topic.title cannot be null");
                expect(err.message).toContain("Topic.description cannot be null");
                
                done();
            })
        });
    
    });

    describe("#getPosts()", () => {

        it("should return the associated posts", (done) => {
   
            this.topic.getPosts()
            .then((posts) => {
                expect(posts[0].title).toBe("Yellowstone National Park");
                
                done();
            });
   
        });
   
    });

});