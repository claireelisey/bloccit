const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
// require the User model to use it in our tests
const User = require("../../src/db/models").User;

describe("Post", () => {

    beforeEach((done) => {
        this.topic;
        this.post;
        this.user;
   
        sequelize.sync({force: true}).then((res) => {
   
// create a User object
            User.create({
                email: "starman@tesla.com",
                password: "Trekkie4lyfe"
                })
                .then((user) => {
                    this.user = user; //store the user
   
// create a Topic object
                    Topic.create({
                        title: "Expeditions to Alpha Centauri",
                        description: "A compilation of reports from recent visits to the star system.",
   
// for each object in posts, Sequelize will create a Post object with the attribute values provided
                        posts: [{
                            title: "My first visit to Proxima Centauri b",
                            body: "I saw some rocks.",
                            userId: this.user.id
                        }]
                    }, {
   
// the include property allows us to tell the method what model to use as well as where to store the resulting posts as in the Topic object
                            include: {
                                model: Post,
                                as: "posts"
                            }
                    })
                    .then((topic) => {
                        this.topic = topic; //store the topic
                        this.post = topic.posts[0]; //store the post
                        
                        done();
                    })
                })
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
                expect(posts[0].title).toBe("My first visit to Proxima Centauri b");
                
                done();
            });
   
        });
   
    });

});